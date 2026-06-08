from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.db.session import get_db
from app.models.entities import Appeal, News, Page, RegionOffice, Status, User
from app.schemas.dto import AppealCreate, NewsOut, PageOut, RegionOfficeOut, TrackingOut
from app.services.localization import localized, pick_locale
from app.services.tracking import make_tracking_code

router = APIRouter()


@router.get("/news", response_model=list[NewsOut])
def list_news(locale: str = Query("ru"), db: Session = Depends(get_db)):
    lang = pick_locale(locale)
    rows = db.query(News).filter(News.status == Status.published).order_by(News.published_at.desc()).limit(20).all()
    return [NewsOut(id=row.id, title=localized(row, "title", lang), summary=localized(row, "summary", lang), category=row.category, published_at=row.published_at) for row in rows]


@router.get("/pages/{slug}", response_model=PageOut)
def get_page(slug: str, locale: str = Query("ru"), db: Session = Depends(get_db)):
    lang = pick_locale(locale)
    row = db.query(Page).filter(Page.slug == slug, Page.status == Status.published).one()
    return PageOut(id=row.id, slug=row.slug, title=localized(row, "title", lang), body=localized(row, "body", lang))


@router.post("/appeals", response_model=TrackingOut, status_code=201)
def create_appeal(payload: AppealCreate, db: Session = Depends(get_db), _user: User = Depends(current_user)):
    row = Appeal(tracking_code=make_tracking_code("APL"), **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return TrackingOut(tracking_code=row.tracking_code, status=row.status.value)


@router.get("/appeals/{tracking_code}", response_model=TrackingOut)
def get_appeal_status(tracking_code: str, db: Session = Depends(get_db)):
    row = db.query(Appeal).filter(Appeal.tracking_code == tracking_code).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appeal not found")
    return TrackingOut(tracking_code=row.tracking_code, status=row.status.value)


@router.get("/contacts/regions", response_model=list[RegionOfficeOut])
def list_region_offices(db: Session = Depends(get_db)):
    return db.query(RegionOffice).order_by(RegionOffice.region.asc()).all()
