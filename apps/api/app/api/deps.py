from fastapi import Depends, HTTPException, Request, status
from datetime import datetime, timezone
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.entities import AuthSession, Role, User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/telegram/complete")


def current_user(request: Request, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm], options={"require": ["exp", "sub", "sid"]})
        user_id = payload.get("sub")
        if not user_id:
            raise InvalidTokenError("Missing subject")
        parsed_user_id = int(user_id)
    except (InvalidTokenError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials") from exc
    session = db.query(AuthSession).filter(AuthSession.id == str(payload["sid"]), AuthSession.user_id == parsed_user_id, AuthSession.revoked_at.is_(None), AuthSession.expires_at > datetime.now(timezone.utc)).first()
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or revoked")
    request.state.auth_session_id = session.id
    user = db.query(User).filter(User.id == parsed_user_id, User.is_active.is_(True), User.is_blocked.is_(False)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return user


def current_admin_session_user(request: Request, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm], options={"require": ["exp", "sub", "sid"]})
        user_id = payload.get("sub")
        is_admin_session = payload.get("admin_session") is True
        if not user_id or not is_admin_session:
            raise InvalidTokenError("Missing admin session")
        parsed_user_id = int(user_id)
    except (InvalidTokenError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin session") from exc
    session = db.query(AuthSession).filter(AuthSession.id == str(payload["sid"]), AuthSession.user_id == parsed_user_id, AuthSession.revoked_at.is_(None), AuthSession.expires_at > datetime.now(timezone.utc)).first()
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or revoked")
    request.state.auth_session_id = session.id
    user = db.query(User).filter(User.id == parsed_user_id, User.is_active.is_(True), User.is_blocked.is_(False)).first()
    if not user or (user.email or "").lower() != settings.admin_portal_allowed_user_email.lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return user


def require_roles(*roles: Role):
    def guard(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return user
    return guard
