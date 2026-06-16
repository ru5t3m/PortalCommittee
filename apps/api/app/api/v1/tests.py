from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import current_admin_session_user, current_user
from app.api.v1.auth import serialize_candidate, serialize_user
from app.db.session import get_db
from app.models.entities import CandidateApplication, PsychologicalTestProgress, PsychologicalTestResult, User
from app.schemas.dto import (
    AdminPsychologicalTestResultOut,
    PsychologicalTestProgressOut,
    PsychologicalTestProgressSave,
    PsychologicalTestResultCreate,
    PsychologicalTestResultOut,
)

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
        answers=row.answers,
    )


def serialize_progress(row: PsychologicalTestProgress) -> PsychologicalTestProgressOut:
    return PsychologicalTestProgressOut(
        id=row.id,
        test_slug=row.test_slug,
        test_title=row.test_title,
        total_questions=row.total_questions,
        answered_questions=row.answered_questions,
        current_section_index=row.current_section_index,
        sections=row.sections,
        answers=row.answers,
        updated_at=row.updated_at,
    )


@router.get("/psychological-tests/progress/{test_slug}", response_model=PsychologicalTestProgressOut)
def get_progress(test_slug: str, db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = (
        db.query(PsychologicalTestProgress)
        .filter(PsychologicalTestProgress.user_id == user.id, PsychologicalTestProgress.test_slug == test_slug)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Psychological test progress not found")
    return serialize_progress(row)


@router.put("/psychological-tests/progress", response_model=PsychologicalTestProgressOut)
def save_progress(payload: PsychologicalTestProgressSave, db: Session = Depends(get_db), user: User = Depends(current_user)):
    if payload.answered_questions > payload.total_questions:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Answered questions cannot exceed total questions")

    row = (
        db.query(PsychologicalTestProgress)
        .filter(PsychologicalTestProgress.user_id == user.id, PsychologicalTestProgress.test_slug == payload.test_slug)
        .first()
    )
    if row is None:
        row = PsychologicalTestProgress(user_id=user.id, test_slug=payload.test_slug)
        db.add(row)

    row.test_title = payload.test_title
    row.total_questions = payload.total_questions
    row.answered_questions = payload.answered_questions
    row.current_section_index = payload.current_section_index
    row.sections = [section.model_dump() for section in payload.sections]
    row.answers = payload.answers
    db.commit()
    db.refresh(row)
    return serialize_progress(row)


@router.delete("/psychological-tests/progress/{test_slug}", status_code=204)
def delete_progress(test_slug: str, db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = (
        db.query(PsychologicalTestProgress)
        .filter(PsychologicalTestProgress.user_id == user.id, PsychologicalTestProgress.test_slug == test_slug)
        .first()
    )
    if row:
        db.delete(row)
        db.commit()
    return None


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
    progress = (
        db.query(PsychologicalTestProgress)
        .filter(PsychologicalTestProgress.user_id == user.id, PsychologicalTestProgress.test_slug == payload.test_slug)
        .first()
    )
    if progress:
        db.delete(progress)
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
