import json
import secrets
from datetime import datetime, timedelta, timezone
from urllib import request as urllib_request
from urllib.error import URLError

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token, hash_token
from app.db.session import get_db
from app.models.entities import CandidateApplication, LoginAttempt, RefreshSession, Role, TelegramLoginChallenge, User
from app.schemas.dto import AuthMeOut, CandidateApplicationOut, TelegramLoginCompleteIn, TelegramLoginStartOut, TelegramLoginStatusOut, TokenOut, UserOut

router = APIRouter()

REFRESH_COOKIE_NAME = "knb_refresh_token"
LOCKOUT_WINDOW_MINUTES = 15
TELEGRAM_START_PREFIX = "/start"
MAX_TELEGRAM_CHALLENGES_PER_WINDOW = 5


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
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=cookie_secure(),
        samesite="lax",
        path="/api/v1/auth",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/v1/auth")


def token_out(user: User) -> TokenOut:
    settings = get_settings()
    return TokenOut(
        access_token=create_access_token(str(user.id), user.role.value),
        expires_in=settings.access_token_minutes * 60,
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


def record_telegram_attempt(
    db: Session,
    *,
    telegram_id: str | None,
    request: Request,
    user: User | None,
    success: bool,
    reason: str | None = None,
) -> None:
    record_login_attempt(
        db,
        email=f"telegram:{telegram_id or 'unknown'}",
        request=request,
        user=user,
        success=success,
        reason=reason,
    )


def create_refresh_session(db: Session, user: User, request: Request, response: Response) -> None:
    settings = get_settings()
    raw_token = create_refresh_token()
    session = RefreshSession(
        user_id=user.id,
        token_hash=hash_token(raw_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_days),
        created_ip=client_ip(request),
        user_agent=user_agent(request),
    )
    db.add(session)
    set_refresh_cookie(response, raw_token)


def is_expired(expires_at: datetime, now: datetime) -> bool:
    if expires_at.tzinfo is None:
        return expires_at <= now.replace(tzinfo=None)
    return expires_at <= now


def telegram_api_call(method: str, payload: dict) -> None:
    settings = get_settings()
    if not settings.telegram_bot_token:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Telegram bot is not configured")

    body = json.dumps(payload).encode("utf-8")
    req = urllib_request.Request(
        f"https://api.telegram.org/bot{settings.telegram_bot_token}/{method}",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib_request.urlopen(req, timeout=8) as response:
            if response.status >= 400:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Telegram API request failed")
    except URLError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Telegram API request failed") from exc


def ensure_telegram_configured() -> None:
    settings = get_settings()
    if not settings.telegram_bot_token or not settings.telegram_bot_username:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Telegram login is not configured")


def expire_challenge_if_needed(challenge: TelegramLoginChallenge, now: datetime) -> None:
    if is_expired(challenge.expires_at, now) and challenge.status not in {"consumed", "expired"}:
        challenge.status = "expired"


def role_for_telegram_id(telegram_id: str) -> Role:
    settings = get_settings()
    if telegram_id in settings.telegram_admin_ids:
        return Role.admin
    if telegram_id in settings.telegram_moderator_ids:
        return Role.moderator
    return Role.candidate


def telegram_full_name(first_name: str | None, last_name: str | None, username: str | None) -> str:
    name = " ".join(part.strip() for part in [first_name, last_name] if part and part.strip())
    if name:
        return name[:255]
    if username:
        return f"Telegram @{username}"[:255]
    return "Telegram user"


@router.post("/auth/telegram/start", response_model=TelegramLoginStartOut, status_code=201)
def start_telegram_login(request: Request, db: Session = Depends(get_db)):
    ensure_telegram_configured()
    settings = get_settings()
    ip = client_ip(request)
    if ip:
        since = datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
        recent_count = (
            db.query(TelegramLoginChallenge)
            .filter(TelegramLoginChallenge.created_ip == ip, TelegramLoginChallenge.created_at >= since)
            .count()
        )
        if recent_count >= MAX_TELEGRAM_CHALLENGES_PER_WINDOW:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many Telegram login requests")
    nonce = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.telegram_login_challenge_minutes)
    challenge = TelegramLoginChallenge(
        nonce=nonce,
        status="pending",
        expires_at=expires_at,
        created_ip=client_ip(request),
        user_agent=user_agent(request),
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return TelegramLoginStartOut(
        challenge_id=challenge.id,
        nonce=challenge.nonce,
        deep_link=f"https://t.me/{settings.telegram_bot_username}?start={challenge.nonce}",
        expires_at=challenge.expires_at,
    )


@router.get("/auth/telegram/status/{challenge_id}", response_model=TelegramLoginStatusOut)
def telegram_login_status(challenge_id: int, db: Session = Depends(get_db)):
    challenge = db.query(TelegramLoginChallenge).filter(TelegramLoginChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Telegram login request not found")
    expire_challenge_if_needed(challenge, datetime.now(timezone.utc))
    db.commit()
    return TelegramLoginStatusOut(
        challenge_id=challenge.id,
        status=challenge.status,
        expires_at=challenge.expires_at,
        phone_verified=challenge.status == "verified" and bool(challenge.phone),
    )


@router.post("/auth/telegram/complete", response_model=TokenOut)
def complete_telegram_login(payload: TelegramLoginCompleteIn, request: Request, response: Response, db: Session = Depends(get_db)):
    challenge = (
        db.query(TelegramLoginChallenge)
        .filter(TelegramLoginChallenge.id == payload.challenge_id, TelegramLoginChallenge.nonce == payload.nonce)
        .first()
    )
    now = datetime.now(timezone.utc)
    if not challenge:
        record_telegram_attempt(db, telegram_id=None, request=request, user=None, success=False, reason="challenge_not_found")
        db.commit()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Telegram login request not found")

    expire_challenge_if_needed(challenge, now)
    if challenge.status != "verified" or not challenge.telegram_id or not challenge.phone or challenge.consumed_at is not None:
        record_telegram_attempt(db, telegram_id=challenge.telegram_id, request=request, user=None, success=False, reason="challenge_not_verified")
        db.commit()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Telegram phone confirmation is not complete")

    user = db.query(User).filter(User.telegram_id == challenge.telegram_id).first()
    role = role_for_telegram_id(challenge.telegram_id)
    if not user:
        user = User(
            email=None,
            full_name=telegram_full_name(challenge.first_name, challenge.last_name, challenge.telegram_username),
            hashed_password=None,
            telegram_id=challenge.telegram_id,
            telegram_username=challenge.telegram_username,
            phone=challenge.phone,
            phone_verified=True,
            role=role,
        )
        db.add(user)
        db.flush()
    else:
        if not user.is_active or user.is_blocked:
            record_telegram_attempt(db, telegram_id=challenge.telegram_id, request=request, user=user, success=False, reason="blocked_or_inactive")
            db.commit()
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")
        user.telegram_username = challenge.telegram_username
        user.phone = challenge.phone
        user.phone_verified = True
        user.full_name = telegram_full_name(challenge.first_name, challenge.last_name, challenge.telegram_username)
        if role in {Role.admin, Role.moderator}:
            user.role = role

    if not user.is_active or user.is_blocked:
        record_telegram_attempt(db, telegram_id=challenge.telegram_id, request=request, user=user, success=False, reason="blocked_or_inactive")
        db.commit()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

    user.failed_login_count = 0
    user.last_login_at = now
    challenge.status = "consumed"
    challenge.consumed_at = now
    record_telegram_attempt(db, telegram_id=challenge.telegram_id, request=request, user=user, success=True, reason="telegram_phone")
    create_refresh_session(db, user, request, response)
    db.commit()
    db.refresh(user)
    return token_out(user)


@router.post("/auth/telegram/webhook")
def telegram_webhook(request: Request, update: dict = Body(...), db: Session = Depends(get_db)):
    settings = get_settings()
    if settings.telegram_webhook_secret:
        supplied_secret = request.headers.get("x-telegram-bot-api-secret-token")
        if supplied_secret != settings.telegram_webhook_secret:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Telegram webhook secret")

    message = update.get("message") or {}
    chat = message.get("chat") or {}
    sender = message.get("from") or {}
    chat_id = chat.get("id")
    telegram_id = sender.get("id")
    if not chat_id or not telegram_id:
        return {"ok": True}

    text = (message.get("text") or "").strip()
    now = datetime.now(timezone.utc)
    if text.startswith(TELEGRAM_START_PREFIX):
        nonce = text.removeprefix(TELEGRAM_START_PREFIX).strip()
        challenge = db.query(TelegramLoginChallenge).filter(TelegramLoginChallenge.nonce == nonce).first()
        if not challenge:
            telegram_api_call("sendMessage", {"chat_id": chat_id, "text": "Заявка на вход не найдена. Вернитесь на сайт и начните вход заново."})
            return {"ok": True}
        expire_challenge_if_needed(challenge, now)
        if challenge.status == "expired":
            db.commit()
            telegram_api_call("sendMessage", {"chat_id": chat_id, "text": "Срок подтверждения истек. Вернитесь на сайт и начните вход заново."})
            return {"ok": True}

        challenge.telegram_id = str(telegram_id)
        challenge.telegram_username = sender.get("username")
        challenge.first_name = sender.get("first_name")
        challenge.last_name = sender.get("last_name")
        challenge.status = "awaiting_contact"
        db.commit()
        telegram_api_call(
            "sendMessage",
            {
                "chat_id": chat_id,
                "text": "Для входа на портал подтвердите номер телефона через Telegram.",
                "reply_markup": {
                    "keyboard": [[{"text": "Поделиться номером телефона", "request_contact": True}]],
                    "resize_keyboard": True,
                    "one_time_keyboard": True,
                },
            },
        )
        return {"ok": True}

    contact = message.get("contact")
    if contact:
        challenge = (
            db.query(TelegramLoginChallenge)
            .filter(
                TelegramLoginChallenge.telegram_id == str(telegram_id),
                TelegramLoginChallenge.status.in_(["pending", "awaiting_contact"]),
            )
            .order_by(TelegramLoginChallenge.created_at.desc())
            .first()
        )
        if not challenge:
            telegram_api_call("sendMessage", {"chat_id": chat_id, "text": "Активная заявка на вход не найдена. Вернитесь на сайт и начните вход заново."})
            return {"ok": True}
        expire_challenge_if_needed(challenge, now)
        if challenge.status == "expired":
            db.commit()
            telegram_api_call("sendMessage", {"chat_id": chat_id, "text": "Срок подтверждения истек. Вернитесь на сайт и начните вход заново."})
            return {"ok": True}
        if str(contact.get("user_id")) != str(telegram_id):
            challenge.attempt_count += 1
            db.commit()
            telegram_api_call("sendMessage", {"chat_id": chat_id, "text": "Нужно поделиться номером именно текущего Telegram-аккаунта."})
            return {"ok": True}

        challenge.phone = str(contact.get("phone_number") or "")[:60]
        challenge.telegram_username = sender.get("username")
        challenge.first_name = sender.get("first_name")
        challenge.last_name = sender.get("last_name")
        challenge.status = "verified"
        challenge.verified_at = now
        db.commit()
        telegram_api_call(
            "sendMessage",
            {
                "chat_id": chat_id,
                "text": "Номер подтвержден. Вернитесь на сайт, вход будет завершен автоматически.",
                "reply_markup": {"remove_keyboard": True},
            },
        )
    return {"ok": True}


@router.post("/auth/refresh", response_model=TokenOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    session = db.query(RefreshSession).filter(RefreshSession.token_hash == hash_token(raw_token)).first()
    now = datetime.now(timezone.utc)
    if not session or session.revoked_at is not None or is_expired(session.expires_at, now):
        clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == session.user_id, User.is_active.is_(True), User.is_blocked.is_(False)).first()
    if not user:
        session.revoked_at = now
        clear_refresh_cookie(response)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    session.revoked_at = now
    create_refresh_session(db, user, request, response)
    db.commit()
    db.refresh(user)
    return token_out(user)


@router.post("/auth/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_token:
        session = db.query(RefreshSession).filter(RefreshSession.token_hash == hash_token(raw_token), RefreshSession.revoked_at.is_(None)).first()
        if session:
            session.revoked_at = datetime.now(timezone.utc)
            db.commit()
    clear_refresh_cookie(response)
    return {"ok": True}


@router.get("/auth/me", response_model=AuthMeOut)
def me(user: User = Depends(current_user)):
    return AuthMeOut(user=serialize_user(user), candidate_application=serialize_candidate(user.candidate_application))
