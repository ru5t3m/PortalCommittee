from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import current_admin_session_user
from app.db.session import get_db
from app.models.entities import Appeal, AppealStatus, AuditLog, CandidateApplication, CandidateStatus, RegionOffice, User
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


def record_audit(db: Session, request: Request, actor: User, action: str, entity: str, entity_id: str) -> None:
    db.add(
        AuditLog(
            actor_id=actor.id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            ip_address=client_ip(request),
        )
    )


@router.get("/dashboard", response_model=AdminDashboardOut)
def dashboard(db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    return AdminDashboardOut(
        actor=serialize_user(user),
        users=db.query(User).count(),
        appeals=db.query(Appeal).count(),
        candidates=db.query(CandidateApplication).count(),
        region_offices=db.query(RegionOffice).count(),
    )


@router.get("/appeals", response_model=list[AdminAppealOut])
def list_appeals(db: Session = Depends(get_db)):
    rows = db.query(Appeal).order_by(Appeal.created_at.desc()).limit(200).all()
    return [serialize_appeal(row) for row in rows]


@router.get("/appeals/{appeal_id}", response_model=AdminAppealOut)
def get_appeal(appeal_id: int, db: Session = Depends(get_db)):
    row = db.get(Appeal, appeal_id)
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
    row = db.get(Appeal, appeal_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appeal not found")

    row.status = AppealStatus(payload.status)
    record_audit(db, request, user, "update_status", "appeal", str(row.id))
    db.commit()
    db.refresh(row)
    return serialize_appeal(row)


@router.get("/candidates", response_model=list[AdminCandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    rows = db.query(CandidateApplication).options(joinedload(CandidateApplication.user)).order_by(CandidateApplication.created_at.desc()).limit(200).all()
    return [serialize_candidate(row) for row in rows]


@router.get("/candidates/{application_id}", response_model=AdminCandidateOut)
def get_candidate(application_id: int, db: Session = Depends(get_db)):
    row = db.query(CandidateApplication).options(joinedload(CandidateApplication.user)).filter(CandidateApplication.id == application_id).first()
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
    row = db.get(CandidateApplication, application_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate application not found")

    row.status = CandidateStatus(payload.status)
    row.moderator_comment = payload.moderator_comment.strip() if payload.moderator_comment else None
    record_audit(db, request, user, "update_status", "candidate_application", str(row.id))
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
    row = db.get(RegionOffice, office_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region office not found")
    record_audit(db, request, user, "delete", "region_office", str(row.id))
    db.delete(row)
    db.commit()
    return None
