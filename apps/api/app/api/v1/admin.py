from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.entities import Appeal, AuditLog, Document, News, Page, RegionOffice, Role, ThreatReport, User, Vacancy

router = APIRouter(prefix="/admin", dependencies=[Depends(require_roles(Role.admin, Role.editor, Role.hr, Role.moderator))])


CRUD_MODELS = {
    "news": News,
    "pages": Page,
    "vacancies": Vacancy,
    "documents": Document,
    "region-offices": RegionOffice,
}


def record_audit(db: Session, actor: User, action: str, entity: str, entity_id: str) -> None:
    db.add(AuditLog(actor_id=actor.id, action=action, entity=entity, entity_id=entity_id))


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(require_roles(Role.admin, Role.editor, Role.hr, Role.moderator))):
    return {
        "actor": {"email": user.email, "role": user.role.value},
        "news": db.query(News).count(),
        "pages": db.query(Page).count(),
        "appeals": db.query(Appeal).count(),
        "threatReports": db.query(ThreatReport).count(),
        "vacancies": db.query(Vacancy).count(),
        "documents": db.query(Document).count(),
    }


@router.get("/appeals")
def appeals(db: Session = Depends(get_db)):
    return db.query(Appeal).order_by(Appeal.created_at.desc()).limit(100).all()


@router.get("/threat-reports")
def threat_reports(db: Session = Depends(get_db)):
    return db.query(ThreatReport).order_by(ThreatReport.created_at.desc()).limit(100).all()


@router.get("/content/news")
def news(db: Session = Depends(get_db)):
    return db.query(News).order_by(News.created_at.desc()).all()


@router.get("/content/pages")
def pages(db: Session = Depends(get_db)):
    return db.query(Page).order_by(Page.slug.asc()).all()


@router.get("/{entity}")
def list_entities(entity: str, db: Session = Depends(get_db)):
    model = CRUD_MODELS.get(entity)
    if not model:
        raise HTTPException(status_code=404, detail="Unknown entity")
    return db.query(model).order_by(model.id.desc()).limit(200).all()


@router.post("/{entity}", dependencies=[Depends(require_roles(Role.admin, Role.editor, Role.hr))])
def create_entity(entity: str, payload: dict, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.admin, Role.editor, Role.hr))):
    model = CRUD_MODELS.get(entity)
    if not model:
        raise HTTPException(status_code=404, detail="Unknown entity")
    row = model(**payload)
    db.add(row)
    db.flush()
    record_audit(db, user, "create", entity, str(row.id))
    db.commit()
    db.refresh(row)
    return row


@router.patch("/{entity}/{entity_id}", dependencies=[Depends(require_roles(Role.admin, Role.editor, Role.hr, Role.moderator))])
def update_entity(entity: str, entity_id: int, payload: dict, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.admin, Role.editor, Role.hr, Role.moderator))):
    model = CRUD_MODELS.get(entity)
    if not model:
        raise HTTPException(status_code=404, detail="Unknown entity")
    row = db.get(model, entity_id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in payload.items():
        if hasattr(row, key) and key not in {"id", "created_at", "updated_at"}:
            setattr(row, key, value)
    record_audit(db, user, "update", entity, str(entity_id))
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{entity}/{entity_id}", dependencies=[Depends(require_roles(Role.admin))])
def delete_entity(entity: str, entity_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(Role.admin))):
    model = CRUD_MODELS.get(entity)
    if not model:
        raise HTTPException(status_code=404, detail="Unknown entity")
    row = db.get(model, entity_id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(row)
    record_audit(db, user, "delete", entity, str(entity_id))
    db.commit()
    return {"deleted": True}
