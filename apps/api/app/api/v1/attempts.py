from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError

from app.api.deps import current_user
from app.db.session import get_db
from app.models.entities import PsychologicalTestAttempt, User
from app.services import test_attempts as service

router = APIRouter()


class StartAttempt(BaseModel):
    model_config = ConfigDict(extra="forbid")
    test_slug: Literal["primary-selection"]
    locale: Literal["ru", "kk"] = "ru"
    restart: bool = False


class AttemptAction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    version: int = Field(ge=1)
    event_id: UUID
    question_id: str | None = Field(default=None, max_length=80)
    answer: str | list[str] = Field(default="", max_length=1000)


def owned_attempt(db, attempt_id, user):
    row = db.query(PsychologicalTestAttempt).filter_by(id=str(attempt_id), user_id=user.id).with_for_update().first()
    if row is None:
        raise HTTPException(404, "Attempt not found")
    return row


def commit(db):
    try:
        db.commit()
    except (StaleDataError, IntegrityError) as exc:
        db.rollback()
        raise HTTPException(409, "Attempt changed; reload its state") from exc


@router.post("/psychological-tests/attempts")
def start(payload: StartAttempt, db: Session = Depends(get_db), user: User = Depends(current_user)):
    key = f"{user.id}:{payload.test_slug}"
    row = db.query(PsychologicalTestAttempt).filter_by(active_key=key).with_for_update().first()
    if row is None and not payload.restart:
        row = db.query(PsychologicalTestAttempt).filter_by(user_id=user.id, test_slug=payload.test_slug).order_by(PsychologicalTestAttempt.created_at.desc(), PsychologicalTestAttempt.id.desc()).first()
    if row is None:
        row = PsychologicalTestAttempt(id=str(uuid4()), user_id=user.id, test_slug=payload.test_slug,
                                       bank_version=service.BANK_VERSION, locale=payload.locale, active_key=key)
        db.add(row)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            row = db.query(PsychologicalTestAttempt).filter_by(active_key=key).with_for_update().one()
    now = service.utcnow()
    service.expire(row, now)
    commit(db)
    return service.state(row, db, now)


@router.get("/psychological-tests/attempts/{attempt_id}")
def get_attempt(attempt_id: UUID, db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = owned_attempt(db, attempt_id, user)
    now = service.utcnow()
    service.expire(row, now)
    commit(db)
    return service.state(row, db, now)


@router.post("/psychological-tests/attempts/{attempt_id}/{action}")
def act(attempt_id: UUID, action: Literal["begin-section", "continue", "answer", "draft", "close-section", "finish"], payload: AttemptAction,
        db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = owned_attempt(db, attempt_id, user)
    now = service.utcnow()
    service.expire(row, now)
    if db.is_modified(row):
        commit(db)
        row = owned_attempt(db, attempt_id, user)
    service.apply_action(row, action, payload, db, now)
    commit(db)
    return service.state(row, db, now)
