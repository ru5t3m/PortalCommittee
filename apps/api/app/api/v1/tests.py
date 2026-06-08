from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import current_admin_session_user, current_user
from app.api.v1.auth import serialize_candidate, serialize_user
from app.db.session import get_db
from app.models.entities import CandidateApplication, PsychologicalTestResult, User
from app.schemas.dto import AdminPsychologicalTestResultOut, PsychologicalTestResultCreate, PsychologicalTestResultOut

router = APIRouter()


def serialize_result(row: PsychologicalTestResult) -> PsychologicalTestResultOut:
    return PsychologicalTestResultOut(
        id=row.id,
        test_slug=row.test_slug,
        test_title=row.test_title,
        total_questions=row.total_questions,
        answered_questions=row.answered_questions,
        duration_seconds=row.duration_seconds,
        remaining_seconds=row.remaining_seconds,
        sections=row.sections,
        submitted_at=row.submitted_at,
    )


def serialize_admin_result(row: PsychologicalTestResult) -> AdminPsychologicalTestResultOut:
    return AdminPsychologicalTestResultOut(
        **serialize_result(row).model_dump(),
        user=serialize_user(row.user),
        candidate_application=serialize_candidate(row.candidate_application),
    )


@router.post("/psychological-tests/results", response_model=PsychologicalTestResultOut, status_code=201)
def create_result(payload: PsychologicalTestResultCreate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    if payload.answered_questions > payload.total_questions:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Answered questions cannot exceed total questions")

    application = db.query(CandidateApplication).filter(CandidateApplication.user_id == user.id).first()
    row = PsychologicalTestResult(
        user_id=user.id,
        candidate_application_id=application.id if application else None,
        test_slug=payload.test_slug,
        test_title=payload.test_title,
        total_questions=payload.total_questions,
        answered_questions=payload.answered_questions,
        duration_seconds=payload.duration_seconds,
        remaining_seconds=payload.remaining_seconds,
        sections=[section.model_dump() for section in payload.sections],
        answers=payload.answers,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return serialize_result(row)


@router.get("/psychological-tests/results/me", response_model=list[PsychologicalTestResultOut])
def list_my_results(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = (
        db.query(PsychologicalTestResult)
        .filter(PsychologicalTestResult.user_id == user.id)
        .order_by(PsychologicalTestResult.submitted_at.desc())
        .limit(50)
        .all()
    )
    return [serialize_result(row) for row in rows]


@router.get("/admin/psychological-tests/results", response_model=list[AdminPsychologicalTestResultOut])
def list_admin_results(db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    rows = (
        db.query(PsychologicalTestResult)
        .options(joinedload(PsychologicalTestResult.user), joinedload(PsychologicalTestResult.candidate_application))
        .order_by(PsychologicalTestResult.submitted_at.desc())
        .limit(300)
        .all()
    )
    return [serialize_admin_result(row) for row in rows]
