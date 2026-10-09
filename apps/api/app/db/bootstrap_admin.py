import argparse
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import engine
from app.models.entities import AuditLog, AuthSession, RefreshSession, Role, User


def bootstrap(email: str):
    settings = get_settings()
    if email.lower() != settings.admin_portal_allowed_user_email.lower():
        raise RuntimeError("Email must match ADMIN_PORTAL_ALLOWED_USER_EMAIL")
    with Session(engine) as db:
        users = db.query(User).order_by(User.id).with_for_update().all()
        target = next((user for user in users if (user.email or "").lower() == email.lower()), None)
        if target is None or not target.hashed_password or not target.is_active or target.is_blocked:
            raise RuntimeError("An existing active password account is required")
        if target.role == Role.admin:
            return
        if any(user.role == Role.admin and user.is_active and not user.is_blocked for user in users):
            raise RuntimeError("Use the administrator API to manage existing administrators")
        target.role = Role.admin
        target.staff_scope = None
        target.organizational_unit_id = None
        now = datetime.now(timezone.utc)
        db.query(AuthSession).filter_by(user_id=target.id).update({"revoked_at": now})
        db.query(RefreshSession).filter_by(user_id=target.id).update({"revoked_at": now})
        db.add(AuditLog(action="bootstrap_admin", entity="user", entity_id=str(target.id)))
        db.commit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    bootstrap(parser.parse_args().email)
