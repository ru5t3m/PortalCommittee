from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import or_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.api.deps import current_admin_session_user
from app.db.session import get_db
from app.models.entities import Appeal, AppealStatus, AuditLog, AuthSession, CandidateApplication, CandidateStatus, CaseComment, OrganizationalUnit, RefreshSession, RegionOffice, Role, User
from app.services.case_workflow import ListOptions, CaseFilters, filter_cases, search, page
from app.schemas.dto import PageOut, CaseCommentCreate, CaseCommentOut, CaseHistoryOut, AssigneeOut
from app.services.staff_access import can_access_staff, permissions_for, require_administrator, require_central_staff, scope_records
from app.schemas.dto import (
    AdminAppealOut,
    AdminAppealStatusUpdate,
    AdminCandidateOut,
    AdminCandidateStatusUpdate,
    AdminDashboardOut,
    RegionOfficeCreate,
    RegionOfficeOut,
    RegionOfficeUpdate,
    UserOut,
    CaseAssignmentUpdate,
    OrganizationalUnitCreate,
    OrganizationalUnitOut,
    StaffAccessUpdate,
    StaffUserOut,
)

router = APIRouter(prefix="/admin", dependencies=[Depends(current_admin_session_user)])


def client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    return request.client.host if request.client else None


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


def serialize_appeal(row: Appeal) -> AdminAppealOut:
    return AdminAppealOut(
        id=row.id,
        tracking_code=row.tracking_code,
        full_name=row.full_name,
        iin=row.iin,
        email=row.email,
        phone=row.phone,
        subject=row.subject,
        message=row.message,
        status=row.status.value,
        created_at=row.created_at,
        updated_at=row.updated_at,
        organizational_unit_id=row.organizational_unit_id,
        assigned_to_id=row.assigned_to_id,
        assigned_to_name=row.assigned_to.full_name if row.assigned_to else None,
        organizational_unit_name_ru=row.organizational_unit.name_ru if row.organizational_unit else None,
        organizational_unit_name_kk=row.organizational_unit.name_kk if row.organizational_unit else None,
    )


def serialize_candidate(row: CandidateApplication) -> AdminCandidateOut:
    return AdminCandidateOut(
        id=row.id,
        tracking_code=row.tracking_code,
        status=row.status.value,
        first_name=row.first_name,
        last_name=row.last_name,
        middle_name=row.middle_name,
        iin=row.iin,
        birth_date=row.birth_date,
        phone=row.phone,
        region=row.region,
        education_level=row.education_level,
        desired_direction=row.desired_direction,
        moderator_comment=row.moderator_comment,
        created_at=row.created_at,
        updated_at=row.updated_at,
        user=serialize_user(row.user),
        organizational_unit_id=row.organizational_unit_id,
        assigned_to_id=row.assigned_to_id,
        assigned_to_name=row.assigned_to.full_name if row.assigned_to else None,
        organizational_unit_name_ru=row.organizational_unit.name_ru if row.organizational_unit else None,
        organizational_unit_name_kk=row.organizational_unit.name_kk if row.organizational_unit else None,
    )


def serialize_region_office(row: RegionOffice) -> RegionOfficeOut:
    return RegionOfficeOut(
        id=row.id,
        service=row.service,
        name_ru=row.name_ru,
        name_kk=row.name_kk,
        region_ru=row.region_ru,
        region_kk=row.region_kk,
        phones=row.phones,
        latitude=row.latitude,
        longitude=row.longitude,
    )


def normalize_phones(phones: list[str]) -> list[str]:
    normalized = [phone.strip() for phone in phones if phone.strip()]
    if not normalized:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="At least one phone is required")
    return normalized


def apply_region_office_payload(row: RegionOffice, payload: RegionOfficeCreate | RegionOfficeUpdate) -> None:
    row.service = payload.service
    row.name_ru = payload.name_ru.strip()
    row.name_kk = payload.name_kk.strip()
    row.region_ru = payload.region_ru.strip()
    row.region_kk = payload.region_kk.strip()
    row.phones = normalize_phones(payload.phones)
    row.latitude = payload.latitude.strip()
    row.longitude = payload.longitude.strip()


def record_audit(db: Session, request: Request, actor: User, action: str, entity: str, entity_id: str, details: dict | None = None) -> None:
    db.add(
        AuditLog(
            actor_id=actor.id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            ip_address=client_ip(request),
            actor_name=actor.full_name,
            details=details,
        )
    )


@router.get("/dashboard", response_model=AdminDashboardOut)
def dashboard(db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    return AdminDashboardOut(
        actor=serialize_user(user),
        users=db.query(User).count() if user.role == Role.admin else scope_records(db.query(CandidateApplication), CandidateApplication, user).count(),
        appeals=scope_records(db.query(Appeal), Appeal, user).count(),
        candidates=scope_records(db.query(CandidateApplication), CandidateApplication, user).count(),
        region_offices=db.query(RegionOffice).count(),
        permissions=permissions_for(user),
        candidate_status_counts={key.value: count for key, count in scope_records(db.query(CandidateApplication.status, func.count(CandidateApplication.id)), CandidateApplication, user).group_by(CandidateApplication.status).all()},
    )


@router.get("/appeals", response_model=PageOut[AdminAppealOut] | list[AdminAppealOut])
def list_appeals(options: ListOptions = Depends(), filters: CaseFilters = Depends(), db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    query = filter_cases(scope_records(db.query(Appeal), Appeal, user), Appeal, filters)
    query = search(query, options.q, [Appeal.full_name, Appeal.email, Appeal.phone, Appeal.tracking_code, Appeal.subject, Appeal.iin])
    return page(query.options(joinedload(Appeal.assigned_to), joinedload(Appeal.organizational_unit)).order_by(Appeal.created_at.desc(), Appeal.id.desc()), options, serialize_appeal)


@router.get("/appeals/{appeal_id}", response_model=AdminAppealOut)
def get_appeal(appeal_id: int, db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    row = scope_records(db.query(Appeal), Appeal, user).filter(Appeal.id == appeal_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appeal not found")
    return serialize_appeal(row)


@router.patch("/appeals/{appeal_id}/status", response_model=AdminAppealOut)
def update_appeal_status(
    appeal_id: int,
    payload: AdminAppealStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(current_admin_session_user),
):
    row = scope_records(db.query(Appeal), Appeal, user).filter(Appeal.id == appeal_id).with_for_update().first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appeal not found")

    before = row.status.value
    row.status = AppealStatus(payload.status)
    record_audit(db, request, user, "update_status", "appeal", str(row.id), {"status": {"before": before, "after": payload.status}})
    db.commit()
    db.refresh(row)
    return serialize_appeal(row)


@router.get("/candidates", response_model=PageOut[AdminCandidateOut] | list[AdminCandidateOut])
def list_candidates(options: ListOptions = Depends(), filters: CaseFilters = Depends(), db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    query = filter_cases(scope_records(db.query(CandidateApplication).join(User, CandidateApplication.user_id == User.id), CandidateApplication, user), CandidateApplication, filters)
    query = search(query, options.q, [CandidateApplication.first_name, CandidateApplication.last_name, CandidateApplication.middle_name, CandidateApplication.last_name + " " + CandidateApplication.first_name, CandidateApplication.phone, CandidateApplication.tracking_code, CandidateApplication.iin, User.email])
    return page(query.options(joinedload(CandidateApplication.user), joinedload(CandidateApplication.assigned_to), joinedload(CandidateApplication.organizational_unit)).order_by(CandidateApplication.created_at.desc(), CandidateApplication.id.desc()), options, serialize_candidate)


@router.get("/candidates/{application_id}", response_model=AdminCandidateOut)
def get_candidate(application_id: int, db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    row = scope_records(db.query(CandidateApplication), CandidateApplication, user).options(joinedload(CandidateApplication.user)).filter(CandidateApplication.id == application_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate application not found")
    return serialize_candidate(row)


@router.patch("/candidates/{application_id}/status", response_model=AdminCandidateOut)
def update_candidate_status(
    application_id: int,
    payload: AdminCandidateStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(current_admin_session_user),
):
    row = scope_records(db.query(CandidateApplication), CandidateApplication, user).filter(CandidateApplication.id == application_id).with_for_update().first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate application not found")

    details = {"status": {"before": row.status.value, "after": payload.status}}
    row.status = CandidateStatus(payload.status)
    if "moderator_comment" in payload.model_fields_set:
        comment = payload.moderator_comment.strip() if payload.moderator_comment else None
        details["moderator_comment"] = {"before": row.moderator_comment, "after": comment}
        row.moderator_comment = comment
    record_audit(db, request, user, "update_status", "candidate_application", str(row.id), details)
    db.commit()
    db.refresh(row)
    return serialize_candidate(row)


@router.get("/contacts/regions", response_model=list[RegionOfficeOut])
def list_region_offices(db: Session = Depends(get_db)):
    rows = db.query(RegionOffice).order_by(RegionOffice.service.asc(), RegionOffice.region_ru.asc(), RegionOffice.name_ru.asc()).all()
    return [serialize_region_office(row) for row in rows]


@router.post("/contacts/regions", response_model=RegionOfficeOut, status_code=201)
def create_region_office(
    payload: RegionOfficeCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(current_admin_session_user),
):
    require_administrator(user)
    row = RegionOffice(
        service=payload.service,
        name_ru=payload.name_ru.strip(),
        name_kk=payload.name_kk.strip(),
        region_ru=payload.region_ru.strip(),
        region_kk=payload.region_kk.strip(),
        phones=normalize_phones(payload.phones),
        latitude=payload.latitude.strip(),
        longitude=payload.longitude.strip(),
    )
    db.add(row)
    db.flush()
    record_audit(db, request, user, "create", "region_office", str(row.id))
    db.commit()
    db.refresh(row)
    return serialize_region_office(row)


@router.put("/contacts/regions/{office_id}", response_model=RegionOfficeOut)
def update_region_office(
    office_id: int,
    payload: RegionOfficeUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(current_admin_session_user),
):
    require_administrator(user)
    row = db.get(RegionOffice, office_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region office not found")
    apply_region_office_payload(row, payload)
    record_audit(db, request, user, "update", "region_office", str(row.id))
    db.commit()
    db.refresh(row)
    return serialize_region_office(row)


@router.delete("/contacts/regions/{office_id}", status_code=204)
def delete_region_office(
    office_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(current_admin_session_user),
):
    require_administrator(user)
    row = db.get(RegionOffice, office_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region office not found")
    record_audit(db, request, user, "delete", "region_office", str(row.id))
    db.delete(row)
    db.commit()
    return None


def serialize_staff_user(user: User) -> StaffUserOut:
    return StaffUserOut(**serialize_user(user).model_dump(), staff_scope=user.staff_scope,
                        organizational_unit_id=user.organizational_unit_id,
                        is_active=user.is_active, is_blocked=user.is_blocked)


@router.get("/users", response_model=PageOut[StaffUserOut] | list[StaffUserOut])
def list_users(options: ListOptions = Depends(), role: Role | None = None,
               db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    require_administrator(user)
    query = search(db.query(User), options.q, [User.email, User.full_name, User.phone])
    if role is not None:
        query = query.filter(User.role == role)
    return page(query.order_by(User.id), options, serialize_staff_user)


@router.patch("/users/{user_id}/access", response_model=StaffUserOut)
def update_user_access(user_id: int, payload: StaffAccessUpdate, request: Request,
                       db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    require_administrator(user)
    if user_id == user.id:
        raise HTTPException(403, "Cannot change your own access")
    locked = db.query(User).filter(or_(User.role == Role.admin, User.id == user_id)).order_by(User.id).populate_existing().with_for_update().all()
    db.refresh(user)
    if not can_access_staff(user) or user.role != Role.admin:
        raise HTTPException(403, "Administrator access required")
    session = db.query(AuthSession).filter(AuthSession.id == request.state.auth_session_id, AuthSession.user_id == user.id,
        AuthSession.revoked_at.is_(None), AuthSession.expires_at > datetime.now(timezone.utc)).first()
    if session is None:
        raise HTTPException(401, "Session expired or revoked")
    target = next((row for row in locked if row.id == user_id), None)
    if target is None:
        raise HTTPException(404, "User not found")
    if payload.organizational_unit_id is not None and db.get(OrganizationalUnit, payload.organizational_unit_id) is None:
        raise HTTPException(422, "Unknown organizational unit")
    if payload.role != "candidate" and not target.hashed_password:
        raise HTTPException(422, "Staff account must have a password")
    target.role = Role(payload.role)
    target.staff_scope = payload.staff_scope
    target.organizational_unit_id = payload.organizational_unit_id
    if payload.is_active is not None:
        target.is_active = payload.is_active
    if payload.is_blocked is not None:
        target.is_blocked = payload.is_blocked
    now = datetime.now(timezone.utc)
    db.query(AuthSession).filter(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None)).update({"revoked_at": now})
    db.query(RefreshSession).filter(RefreshSession.user_id == user_id, RefreshSession.revoked_at.is_(None)).update({"revoked_at": now})
    record_audit(db, request, user, "update_access", "user", str(user_id))
    db.commit()
    db.refresh(target)
    return serialize_staff_user(target)


@router.get("/organizational-units", response_model=list[OrganizationalUnitOut])
def list_units(db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    require_central_staff(user)
    return db.query(OrganizationalUnit).order_by(OrganizationalUnit.code).all()


@router.post("/organizational-units", response_model=OrganizationalUnitOut, status_code=201)
def create_unit(payload: OrganizationalUnitCreate, request: Request,
                db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    require_administrator(user)
    row = OrganizationalUnit(**payload.model_dump())
    db.add(row)
    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "Organizational unit code already exists") from exc
    record_audit(db, request, user, "create", "organizational_unit", str(row.id))
    db.commit()
    db.refresh(row)
    return row


def assign_case(db: Session, row, payload: CaseAssignmentUpdate):
    if payload.organizational_unit_id is not None and db.get(OrganizationalUnit, payload.organizational_unit_id) is None:
        raise HTTPException(422, "Unknown organizational unit")
    if payload.assigned_to_id is not None:
        assignee = db.get(User, payload.assigned_to_id)
        if assignee is None or not can_access_staff(assignee):
            raise HTTPException(422, "Assignee must be active staff")
        if assignee.staff_scope == "territorial" and assignee.organizational_unit_id != payload.organizational_unit_id:
            raise HTTPException(422, "Assignee belongs to another organizational unit")
    row.organizational_unit_id = payload.organizational_unit_id
    row.assigned_to_id = payload.assigned_to_id


@router.patch("/appeals/{appeal_id}/assignment", response_model=AdminAppealOut)
def assign_appeal(appeal_id: int, payload: CaseAssignmentUpdate, request: Request,
                  db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    require_central_staff(user)
    row = db.query(Appeal).filter_by(id=appeal_id).with_for_update().first()
    if row is None:
        raise HTTPException(404, "Appeal not found")
    details = assignment_changes(row, payload)
    assign_case(db, row, payload)
    record_audit(db, request, user, "assign", "appeal", str(row.id), details)
    db.commit()
    db.refresh(row)
    return serialize_appeal(row)


@router.patch("/candidates/{application_id}/assignment", response_model=AdminCandidateOut)
def assign_candidate(application_id: int, payload: CaseAssignmentUpdate, request: Request,
                     db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    require_central_staff(user)
    row = db.query(CandidateApplication).filter_by(id=application_id).with_for_update().first()
    if row is None:
        raise HTTPException(404, "Candidate application not found")
    details = assignment_changes(row, payload)
    assign_case(db, row, payload)
    record_audit(db, request, user, "assign", "candidate_application", str(row.id), details)
    db.commit()
    db.refresh(row)
    return serialize_candidate(row)


def assignment_changes(row, payload):
    return {key: {"before": getattr(row, key), "after": getattr(payload, key)} for key in ("organizational_unit_id", "assigned_to_id")}


@router.put("/organizational-units/{unit_id}", response_model=OrganizationalUnitOut)
def update_unit(unit_id: int, payload: OrganizationalUnitCreate, request: Request,
                db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    require_administrator(user)
    row = db.query(OrganizationalUnit).filter_by(id=unit_id).with_for_update().first()
    if row is None:
        raise HTTPException(404, "Organizational unit not found")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "Organizational unit code already exists") from exc
    record_audit(db, request, user, "update", "organizational_unit", str(row.id))
    db.commit()
    return row


@router.get("/assignees", response_model=PageOut[AssigneeOut] | list[AssigneeOut])
def list_assignees(options: ListOptions = Depends(), db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    query = db.query(User).filter(User.is_active.is_(True), User.is_blocked.is_(False), or_(User.role == Role.admin, (User.role == Role.moderator) & User.staff_scope.in_(["central", "territorial"])))
    if user.staff_scope == "territorial":
        query = query.filter(User.staff_scope == "territorial", User.organizational_unit_id == user.organizational_unit_id)
    return page(search(query, options.q, [User.full_name, User.email]).order_by(User.full_name, User.id), options)


def scoped_case(kind, identity, db, user, lock=False):
    if kind not in {"appeals", "candidates"}:
        raise HTTPException(404, "Case not found")
    model = Appeal if kind == "appeals" else CandidateApplication
    query = scope_records(db.query(model), model, user).filter(model.id == identity)
    row = (query.with_for_update() if lock else query).first()
    if row is None:
        raise HTTPException(404, "Case not found")
    return row


def comment_target(kind, identity):
    return CaseComment.appeal_id == identity if kind == "appeals" else CaseComment.candidate_application_id == identity


@router.get("/{kind}/{identity}/comments", response_model=PageOut[CaseCommentOut])
def list_comments(kind: str, identity: int, options: ListOptions = Depends(), db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    scoped_case(kind, identity, db, user)
    options.paginated = True
    return page(db.query(CaseComment).filter(comment_target(kind, identity)).order_by(CaseComment.created_at.desc(), CaseComment.id.desc()), options)


@router.post("/{kind}/{identity}/comments", response_model=CaseCommentOut, status_code=201)
def create_comment(kind: str, identity: int, payload: CaseCommentCreate, request: Request,
                   db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    case = scoped_case(kind, identity, db, user, lock=True)
    if kind == "appeals" and payload.visibility == "candidate" and case.owner_id is None:
        raise HTTPException(422, "Legacy appeal has no verified owner; candidate message is unavailable")
    row = CaseComment(author_id=user.id, author_name=user.full_name, **payload.model_dump(),
                      **({"appeal_id": identity} if kind == "appeals" else {"candidate_application_id": identity}))
    db.add(row)
    db.flush()
    case.updated_at = datetime.now(timezone.utc)
    record_audit(db, request, user, "comment", "appeal" if kind == "appeals" else "candidate_application", str(identity), {"comment_id": row.id, "visibility": row.visibility})
    db.commit()
    db.refresh(row)
    return row


@router.get("/{kind}/{identity}/history", response_model=PageOut[CaseHistoryOut])
def case_history(kind: str, identity: int, options: ListOptions = Depends(), db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    scoped_case(kind, identity, db, user)
    options.paginated = True
    query = db.query(AuditLog).filter(AuditLog.entity == ("appeal" if kind == "appeals" else "candidate_application"), AuditLog.entity_id == str(identity))
    return page(query.options(joinedload(AuditLog.actor)).order_by(AuditLog.created_at.desc(), AuditLog.id.desc()), options,
                lambda row: CaseHistoryOut(id=row.id, actor_name=row.actor_name or (row.actor.full_name if row.actor else None), action=row.action, details=row.details, created_at=row.created_at))
