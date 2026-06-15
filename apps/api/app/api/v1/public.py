from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.db.session import get_db
from app.models.entities import Appeal, RegionOffice, User
from app.schemas.dto import AppealCreate, RegionOfficeOut, TrackingOut
from app.services.tracking import make_tracking_code

router = APIRouter()


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
    return db.query(RegionOffice).order_by(RegionOffice.service.asc(), RegionOffice.region_ru.asc(), RegionOffice.name_ru.asc()).all()
