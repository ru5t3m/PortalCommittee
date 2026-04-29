from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Appeal, Document, News, Page, RegionOffice, Status, ThreatReport, Vacancy
from app.schemas.dto import AppealCreate, DocumentOut, NewsOut, PageOut, RegionOfficeOut, ThreatReportCreate, TrackingOut, VacancyOut
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
def create_appeal(payload: AppealCreate, db: Session = Depends(get_db)):
    row = Appeal(tracking_code=make_tracking_code("APL"), **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return TrackingOut(tracking_code=row.tracking_code, status=row.status.value)


@router.post("/threat", response_model=TrackingOut, status_code=201)
def create_threat_report(payload: ThreatReportCreate, db: Session = Depends(get_db)):
    row = ThreatReport(tracking_code=make_tracking_code("THR"), **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return TrackingOut(tracking_code=row.tracking_code, status=row.status.value)


@router.get("/appeals/{tracking_code}", response_model=TrackingOut)
def get_appeal_status(tracking_code: str, db: Session = Depends(get_db)):
    row = db.query(Appeal).filter(Appeal.tracking_code == tracking_code).one()
    return TrackingOut(tracking_code=row.tracking_code, status=row.status.value)


@router.get("/vacancies", response_model=list[VacancyOut])
def list_vacancies(locale: str = Query("ru"), db: Session = Depends(get_db)):
    lang = pick_locale(locale)
    rows = db.query(Vacancy).filter(Vacancy.status == Status.published).all()
    return [VacancyOut(id=row.id, title=localized(row, "title", lang), region=row.region, department=row.department, requirements=row.requirements) for row in rows]


@router.get("/documents", response_model=list[DocumentOut])
def list_documents(locale: str = Query("ru"), db: Session = Depends(get_db)):
    lang = pick_locale(locale)
    rows = db.query(Document).filter(Document.status == Status.published).all()
    return [DocumentOut(id=row.id, title=localized(row, "title", lang), document_type=row.document_type, file_url=row.file_url) for row in rows]


@router.get("/contacts/regions", response_model=list[RegionOfficeOut])
def list_region_offices(db: Session = Depends(get_db)):
    return db.query(RegionOffice).order_by(RegionOffice.region.asc()).all()
