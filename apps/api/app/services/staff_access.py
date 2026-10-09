from fastapi import HTTPException
from sqlalchemy import false

from app.models.entities import Role, User


def can_access_staff(user: User) -> bool:
    if not user.is_active or user.is_blocked:
        return False
    return user.role == Role.admin or (
        user.role == Role.moderator and (
            (user.staff_scope == "central" and user.organizational_unit_id is None)
            or (user.staff_scope == "territorial" and user.organizational_unit_id is not None)
        )
    )


def require_administrator(user: User) -> None:
    if user.role != Role.admin:
        raise HTTPException(403, "Administrator access required")


def require_central_staff(user: User) -> None:
    if user.role != Role.admin and not (user.role == Role.moderator and user.staff_scope == "central"):
        raise HTTPException(403, "Central staff access required")


def scope_records(query, model, user: User):
    if not can_access_staff(user):
        return query.filter(false())
    if user.role == Role.moderator and user.staff_scope == "territorial":
        return query.filter(model.organizational_unit_id == user.organizational_unit_id)
    return query


def permissions_for(user: User) -> list[str]:
    if not can_access_staff(user):
        return []
    permissions = ["cases:read", "cases:update", "results:read"]
    if user.role == Role.admin or user.staff_scope == "central":
        permissions.append("cases:assign")
    if user.role == Role.admin:
        permissions.extend(["users:manage", "units:manage", "contacts:manage"])
    return permissions
