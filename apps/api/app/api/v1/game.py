from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.db.session import get_db
from app.models.entities import User
from app.services import specgame as service

router = APIRouter()


class GameAction(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    action: Literal["next", "choice", "menu", "restart", "timeout"]
    version: int = Field(ge=1, le=2147483646)
    event_id: UUID = Field(strict=False)
    node_id: str = Field(min_length=1, max_length=100)
    choice_index: int | None = Field(default=None, ge=0, le=100)


@router.get("/games/specgame/progress")
def load_progress(user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = service.owned_progress(db, user.id)
    now = service.utcnow()
    service.expire(row, now)
    service.commit(db)
    return service.state(row, now)


@router.post("/games/specgame/actions")
def act(payload: GameAction, user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = service.owned_progress(db, user.id)
    service.commit(db)
    row = service.owned_progress(db, user.id)
    now = service.utcnow()
    service.apply_action(row, payload, now)
    service.commit(db)
    return service.state(row, now)
