from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import current_admin_session_user
from app.db.session import get_db
from app.models.entities import Appeal, AppealStatus, AuditLog, CandidateApplication, CandidateStatus, News, Page, RegionOffice, User
from app.schemas.dto import (
    AdminAppealOut,
    AdminAppealStatusUpdate,
    AdminCandidateOut,
    AdminCandidateStatusUpdate,
    AdminDashboardOut,
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
        news=db.query(News).count(),
        pages=db.query(Page).count(),
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
