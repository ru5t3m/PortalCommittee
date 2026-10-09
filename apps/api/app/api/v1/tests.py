from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import current_admin_session_user, current_user
from app.api.v1.auth import serialize_candidate, serialize_user
from app.db.session import get_db
from app.models.entities import CandidateApplication, PsychologicalTestProgress, PsychologicalTestResult, User
from app.schemas.dto import PageOut
from app.services.case_workflow import ListOptions, search, page
from app.schemas.dto import AdminPsychologicalTestResultOut, PsychologicalTestProgressOut, PsychologicalTestProgressSave, PsychologicalTestResultCreate, PsychologicalTestResultOut
from app.services.test_attempts import bank, result_state, SLUG
from app.services.staff_access import scope_records

router = APIRouter()


def serialize_result(row):
    return PsychologicalTestResultOut(**result_state(row))


def serialize_admin_result(row):
    return AdminPsychologicalTestResultOut(
        **serialize_result(row).model_dump(), user=serialize_user(row.user),
        candidate_application=serialize_candidate(row.candidate_application), answers=row.answers,
        answer_key={q["id"]: {"values": q.get("correctAnswers", []), "explanation": q.get("answerExplanation", "")} for section in bank()["sections"] for q in section["questions"]} if row.test_slug == SLUG else {})


@router.get("/psychological-tests/progress/{test_slug}", response_model=PsychologicalTestProgressOut)
def get_progress(test_slug: str, db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = db.query(PsychologicalTestProgress).filter_by(user_id=user.id, test_slug=test_slug).first()
    if not row:
        raise HTTPException(404, "Psychological test progress not found")
    return PsychologicalTestProgressOut(id=row.id, test_slug=row.test_slug, test_title=row.test_title,
        total_questions=row.total_questions, answered_questions=row.answered_questions,
        current_section_index=row.current_section_index, sections=row.sections, answers=row.answers, updated_at=row.updated_at)


@router.put("/psychological-tests/progress", response_model=PsychologicalTestProgressOut)
def save_progress(payload: PsychologicalTestProgressSave, user: User = Depends(current_user)):
    raise HTTPException(410, "Use the server-managed test attempt endpoints")


@router.delete("/psychological-tests/progress/{test_slug}", status_code=204)
def delete_progress(test_slug: str, user: User = Depends(current_user)):
    raise HTTPException(410, "Use the server-managed test attempt endpoints")


@router.post("/psychological-tests/results", response_model=PsychologicalTestResultOut, status_code=201)
def create_result(payload: PsychologicalTestResultCreate, user: User = Depends(current_user)):
    raise HTTPException(410, "Use the server-managed test attempt endpoints")


@router.get("/psychological-tests/results/me", response_model=list[PsychologicalTestResultOut])
def list_my_results(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = db.query(PsychologicalTestResult).filter_by(user_id=user.id).order_by(PsychologicalTestResult.submitted_at.desc()).limit(50).all()
    return [serialize_result(row) for row in rows]


@router.get("/admin/psychological-tests/results", response_model=PageOut[AdminPsychologicalTestResultOut] | list[AdminPsychologicalTestResultOut])
def list_admin_results(options: ListOptions = Depends(), db: Session = Depends(get_db), user: User = Depends(current_admin_session_user)):
    query = db.query(PsychologicalTestResult).join(User, PsychologicalTestResult.user_id == User.id).outerjoin(CandidateApplication, PsychologicalTestResult.candidate_application_id == CandidateApplication.id)
    if user.staff_scope == "territorial":
        query = scope_records(query.filter(PsychologicalTestResult.user_id == CandidateApplication.user_id), CandidateApplication, user)
    query = search(query, options.q, [User.full_name, User.email, User.phone, CandidateApplication.tracking_code, PsychologicalTestResult.test_title])
    return page(query.options(joinedload(PsychologicalTestResult.user), joinedload(PsychologicalTestResult.candidate_application)).order_by(PsychologicalTestResult.submitted_at.desc(), PsychologicalTestResult.id.desc()), options, serialize_admin_result)
