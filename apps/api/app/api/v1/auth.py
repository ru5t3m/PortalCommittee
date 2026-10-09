import jwt
from uuid import uuid4
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token, hash_password, hash_token, verify_password
from app.db.session import get_db
from app.models.entities import AuthSession, CandidateApplication, LoginAttempt, RefreshSession, Role, User
from app.schemas.dto import (
    AuthMeOut,
    AdminPanelLoginIn,
    CandidateApplicationOut,
    PasswordLoginIn,
    PasswordRegisterIn,
    TokenOut,
    UserOut,
)
from app.services.tracking import make_tracking_code
from app.services.staff_access import can_access_staff

router = APIRouter()

REFRESH_COOKIE_NAME = "knb_refresh_token"
LOCKOUT_WINDOW_MINUTES = 15
MAX_FAILED_ATTEMPTS = 5


def client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    return request.client.host if request.client else None


def user_agent(request: Request) -> str | None:
    value = request.headers.get("user-agent")
    return value[:500] if value else None


def cookie_secure() -> bool:
    return get_settings().environment.lower() == "production"


def set_refresh_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    max_age = settings.refresh_token_days * 24 * 60 * 60
    is_production = cookie_secure()
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        path="/api/v1/auth",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/v1/auth")


def validate_cookie_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    allowed = {str(value).rstrip("/") for value in get_settings().cors_origins}
    if origin is not None and origin.rstrip("/") not in allowed:
        raise HTTPException(403, "Untrusted request origin")


def token_out(user: User, session_id: str) -> TokenOut:
    settings = get_settings()
    return TokenOut(
        access_token=create_access_token(str(user.id), user.role.value, extra_claims={"sid": session_id}),
        expires_in=settings.access_token_minutes * 60,
    )


def admin_token_out(user: User, session_id: str) -> TokenOut:
    settings = get_settings()
    return TokenOut(
        access_token=create_access_token(
            str(user.id),
            user.role.value,
            extra_claims={"admin_session": True, "sid": session_id},
            expires_minutes=settings.admin_access_token_minutes,
        ),
        expires_in=settings.admin_access_token_minutes * 60,
    )


def serialize_user(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        telegram_username=user.telegram_username,
        phone=user.phone,
        phone_verified=user.phone_verified,
    )


def serialize_candidate(application: CandidateApplication | None) -> CandidateApplicationOut | None:
    if not application:
        return None
    return CandidateApplicationOut(
        tracking_code=application.tracking_code,
        status=application.status.value,
        first_name=application.first_name,
        last_name=application.last_name,
        middle_name=application.middle_name,
        phone=application.phone,
        region=application.region,
        education_level=application.education_level,
        desired_direction=application.desired_direction,
    )


def record_login_attempt(
    db: Session,
    *,
    email: str,
    request: Request,
    user: User | None,
    success: bool,
    reason: str | None = None,
) -> None:
    db.add(
        LoginAttempt(
            email=email.lower(),
            user_id=user.id if user else None,
            success=success,
            ip_address=client_ip(request),
            user_agent=user_agent(request),
            reason=reason,
        )
    )


def too_many_recent_failures(db: Session, identifier: str, request: Request) -> bool:
    since = datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
    ip = client_ip(request)
    query = db.query(LoginAttempt).filter(LoginAttempt.success.is_(False), LoginAttempt.created_at >= since)
    if ip:
        query = query.filter(or_(LoginAttempt.email == identifier.lower(), LoginAttempt.ip_address == ip))
    else:
        query = query.filter(LoginAttempt.email == identifier.lower())
    return query.count() >= MAX_FAILED_ATTEMPTS


def create_refresh_session(db: Session, user: User, request: Request, response: Response, auth_session: AuthSession | None = None) -> str:
    if auth_session is None:
        auth_session = AuthSession(id=str(uuid4()), user_id=user.id,
                                   expires_at=datetime.now(timezone.utc) + timedelta(days=get_settings().refresh_token_days))
        db.add(auth_session)
        db.flush()
    raw_token = create_refresh_token()
    db.add(RefreshSession(user_id=user.id, auth_session_id=auth_session.id, token_hash=hash_token(raw_token),
                          expires_at=auth_session.expires_at, created_ip=client_ip(request), user_agent=user_agent(request)))
    set_refresh_cookie(response, raw_token)
    return auth_session.id


def is_expired(expires_at: datetime, now: datetime) -> bool:
    if expires_at.tzinfo is None:
        return expires_at <= now.replace(tzinfo=None)
    return expires_at <= now


def role_for_email(email: str) -> Role:
    return Role.candidate


def validate_password_policy(password: str) -> None:
    has_lower = any(char.islower() for char in password)
    has_upper = any(char.isupper() for char in password)
    has_digit = any(char.isdigit() for char in password)
    if len(password) < 10 or not (has_lower and has_upper and has_digit):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 10 characters and include uppercase, lowercase, and digit characters",
        )


@router.post("/auth/password/register", response_model=TokenOut, status_code=201)
def register_with_password(payload: PasswordRegisterIn, request: Request, response: Response, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if too_many_recent_failures(db, email, request):
        record_login_attempt(db, email=email, request=request, user=None, success=False, reason="rate_limited")
        db.commit()
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts")
    validate_password_policy(payload.password)

    user = db.query(User).filter(User.email == email).first()
    now = datetime.now(timezone.utc)
    if user:
        record_login_attempt(db, email=email, request=request, user=user, success=False, reason="account_exists")
        db.commit()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account already exists")
    if user and (not user.is_active or user.is_blocked):
        record_login_attempt(db, email=email, request=request, user=user, success=False, reason="blocked_or_inactive")
        db.commit()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

    if not user:
        role = role_for_email(email)
        user = User(
            email=email,
            full_name=f"{payload.first_name.strip()} {payload.last_name.strip()}",
            hashed_password=hash_password(payload.password),
            role=role,
            password_changed_at=now,
        )
        db.add(user)
        db.flush()
        if role == Role.candidate:
            db.add(
                CandidateApplication(
                    user_id=user.id,
                    tracking_code=make_tracking_code("CAN"),
                    first_name=payload.first_name.strip(),
                    last_name=payload.last_name.strip(),
                    birth_date=payload.birth_date,
                    phone=payload.phone.strip(),
                )
            )
    else:
        user.full_name = f"{payload.first_name.strip()} {payload.last_name.strip()}"
        user.hashed_password = hash_password(payload.password)
        user.password_changed_at = now
        role = role_for_email(email)
        if not user.candidate_application:
            db.add(
                CandidateApplication(
                    user_id=user.id,
                    tracking_code=make_tracking_code("CAN"),
                    first_name=payload.first_name.strip(),
                    last_name=payload.last_name.strip(),
                    birth_date=payload.birth_date,
                    phone=payload.phone.strip(),
                )
            )

    user.last_login_at = now
    record_login_attempt(db, email=email, request=request, user=user, success=True, reason="password_registered")
    session_id = create_refresh_session(db, user, request, response)
    db.commit()
    db.refresh(user)
    return token_out(user, session_id)


@router.post("/auth/password/login", response_model=TokenOut)
def login_with_password(payload: PasswordLoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if too_many_recent_failures(db, email, request):
        record_login_attempt(db, email=email, request=request, user=None, success=False, reason="rate_limited")
        db.commit()
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts")

    user = db.query(User).filter(User.email == email, User.is_active.is_(True), User.is_blocked.is_(False)).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        record_login_attempt(db, email=email, request=request, user=user, success=False, reason="invalid_credentials")
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    role = role_for_email(email)
    if role in {Role.admin, Role.moderator}:
        user.role = role
    user.last_login_at = datetime.now(timezone.utc)
    record_login_attempt(db, email=email, request=request, user=user, success=True, reason="password_login")
    session_id = create_refresh_session(db, user, request, response)
    db.commit()
    db.refresh(user)
    return token_out(user, session_id)


@router.post("/auth/admin/login", response_model=TokenOut)
def login_admin_panel(
    payload: AdminPanelLoginIn,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    settings = get_settings()
    if not can_access_staff(user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    admin_identifier = f"admin-panel:{payload.email.lower()}"
    if too_many_recent_failures(db, admin_identifier, request):
        record_login_attempt(db, email=admin_identifier, request=request, user=user, success=False, reason="rate_limited")
        db.commit()
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts")

    legacy_admin = user.role == Role.admin and (user.email or "").lower() == settings.admin_portal_allowed_user_email.lower()
    if legacy_admin:
        if not settings.admin_panel_email or not settings.admin_panel_password_hash:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Admin panel login is not configured")
        is_valid_email = payload.email.lower() == settings.admin_panel_email.lower()
        is_valid_password = verify_password(payload.password, settings.admin_panel_password_hash)
    else:
        is_valid_email = payload.email.lower() == (user.email or "").lower()
        is_valid_password = bool(user.hashed_password) and verify_password(payload.password, user.hashed_password)
    if not is_valid_email or not is_valid_password:
        record_login_attempt(db, email=admin_identifier, request=request, user=user, success=False, reason="invalid_admin_credentials")
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    record_login_attempt(db, email=admin_identifier, request=request, user=user, success=True, reason="admin_panel_login")
    db.commit()
    return admin_token_out(user, request.state.auth_session_id)


@router.post("/auth/refresh", response_model=TokenOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    validate_cookie_origin(request)
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(401, "Missing refresh token")
    refresh_row = db.query(RefreshSession).filter_by(token_hash=hash_token(raw_token)).first()
    now = datetime.now(timezone.utc)
    if not refresh_row or not refresh_row.auth_session_id:
        raise HTTPException(401, "Invalid refresh token")
    auth_session = db.query(AuthSession).filter_by(id=refresh_row.auth_session_id).with_for_update().first()
    refresh_row = db.query(RefreshSession).filter_by(id=refresh_row.id).populate_existing().with_for_update().one()
    if not auth_session or auth_session.revoked_at or is_expired(auth_session.expires_at, now) or refresh_row.revoked_at or is_expired(refresh_row.expires_at, now):
        raise HTTPException(401, "Invalid refresh token")
    user = db.query(User).filter(User.id == auth_session.user_id, User.is_active.is_(True), User.is_blocked.is_(False)).first()
    if not user:
        auth_session.revoked_at = now
        db.commit()
        raise HTTPException(401, "Invalid refresh token")
    refresh_row.revoked_at = now
    db.flush()
    session_id = create_refresh_session(db, user, request, response, auth_session)
    db.commit()
    return token_out(user, session_id)


@router.post("/auth/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    validate_cookie_origin(request)
    session_ids = set()
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_token:
        row = db.query(RefreshSession).filter_by(token_hash=hash_token(raw_token)).first()
        if row and row.auth_session_id:
            session_ids.add(row.auth_session_id)
    authorization = request.headers.get("authorization", "")
    if authorization.startswith("Bearer "):
        try:
            settings = get_settings()
            payload = jwt.decode(authorization[7:], settings.jwt_secret, algorithms=[settings.jwt_algorithm], options={"require": ["exp", "sub", "sid"]})
            row = db.query(AuthSession).filter_by(id=payload["sid"], user_id=int(payload["sub"])).first()
            if row:
                session_ids.add(row.id)
        except (jwt.InvalidTokenError, ValueError, TypeError):
            pass
    now = datetime.now(timezone.utc)
    for session_id in sorted(session_ids):
        row = db.query(AuthSession).filter_by(id=session_id).with_for_update().first()
        if row:
            row.revoked_at = now
            db.query(RefreshSession).filter_by(auth_session_id=session_id).update({"revoked_at": now})
    db.commit()
    clear_refresh_cookie(response)
    return {"ok": True}





@router.get("/auth/me", response_model=AuthMeOut)
def me(user: User = Depends(current_user)):
    return AuthMeOut(user=serialize_user(user), candidate_application=serialize_candidate(user.candidate_application), can_access_admin=can_access_staff(user))
