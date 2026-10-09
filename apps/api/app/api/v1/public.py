from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.db.session import get_db
from app.models.entities import Appeal, CaseComment, CandidateApplication, RegionOffice, User
from app.schemas.dto import PageOut, CandidateMessageOut
from app.services.case_workflow import ListOptions, page
from app.schemas.dto import AppealCreate, FaqAssistantRequest, FaqAssistantResponse, FaqAssistantSuggestion, RegionOfficeOut, TrackingOut
from app.services.faq_assistant import LocalLlmUnavailable, faq_source_name, find_faq_answer
from app.services.tracking import make_tracking_code

router = APIRouter()


@router.post("/appeals", response_model=TrackingOut, status_code=201)
def create_appeal(payload: AppealCreate, db: Session = Depends(get_db), _user: User = Depends(current_user)):
    row = Appeal(tracking_code=make_tracking_code("APL"), owner_id=_user.id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return TrackingOut(tracking_code=row.tracking_code, status=row.status.value)


@router.get("/candidate/messages", response_model=PageOut[CandidateMessageOut])
def candidate_messages(options: ListOptions = Depends(), db: Session = Depends(get_db), user: User = Depends(current_user)):
    options.paginated = True
    query = db.query(CaseComment).join(CandidateApplication, CaseComment.candidate_application_id == CandidateApplication.id).filter(CandidateApplication.user_id == user.id, CaseComment.visibility == "candidate")
    return page(query.order_by(CaseComment.created_at.desc(), CaseComment.id.desc()), options)


@router.get("/appeals/{tracking_code}/messages", response_model=PageOut[CandidateMessageOut])
def appeal_messages(tracking_code: str, options: ListOptions = Depends(), db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = db.query(Appeal).filter(Appeal.tracking_code == tracking_code, Appeal.owner_id == user.id).first()
    if row is None:
        raise HTTPException(404, "Appeal not found")
    options.paginated = True
    return page(db.query(CaseComment).filter(CaseComment.appeal_id == row.id, CaseComment.visibility == "candidate").order_by(CaseComment.created_at.desc(), CaseComment.id.desc()), options)


@router.get("/appeals/{tracking_code}", response_model=TrackingOut)
def get_appeal_status(tracking_code: str, db: Session = Depends(get_db)):
    row = db.query(Appeal).filter(Appeal.tracking_code == tracking_code).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appeal not found")
    return TrackingOut(tracking_code=row.tracking_code, status=row.status.value)


@router.get("/contacts/regions", response_model=list[RegionOfficeOut])
def list_region_offices(db: Session = Depends(get_db)):
    return db.query(RegionOffice).order_by(RegionOffice.service.asc(), RegionOffice.region_ru.asc(), RegionOffice.name_ru.asc()).all()


@router.post("/faq-assistant", response_model=FaqAssistantResponse)
def ask_faq_assistant(payload: FaqAssistantRequest):
    try:
        match = find_faq_answer(payload.question)
    except LocalLlmUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Local FAQ LLM is required but unavailable",
        ) from exc
    item = match["item"]
    suggestions = [
        FaqAssistantSuggestion(question=suggestion["question"], section=suggestion["section"])
        for suggestion in match["suggestions"]
    ]
    if item is None:
        return FaqAssistantResponse(
            answer=None,
            matched_question=None,
            section=None,
            confidence=match["confidence"],
            source=faq_source_name(),
            llm_used=match["llm_used"],
            suggestions=suggestions,
        )
    return FaqAssistantResponse(
        answer=item["answer"],
        matched_question=item["question"],
        section=item["section"],
        confidence=match["confidence"],
        source=faq_source_name(),
        llm_used=match["llm_used"],
        suggestions=suggestions,
    )
