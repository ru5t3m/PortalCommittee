from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class NewsOut(BaseModel):
    id: int
    title: str
    summary: str
    category: str
    published_at: datetime | None


class PageOut(BaseModel):
    id: int
    slug: str
    title: str
    body: str


class AppealCreate(BaseModel):
    full_name: str = Field(min_length=3, max_length=255)
    iin: str | None = Field(default=None, min_length=12, max_length=12)
    email: EmailStr
    phone: str = Field(min_length=5, max_length=60)
    subject: str = Field(min_length=5, max_length=255)
    message: str = Field(min_length=20, max_length=8000)


class ThreatReportCreate(BaseModel):
    report_type: str = Field(min_length=3, max_length=120)
    location: str | None = Field(default=None, max_length=255)
    contact: str | None = Field(default=None, max_length=255)
    description: str = Field(min_length=20, max_length=8000)
    urgent: bool = False


class TrackingOut(BaseModel):
    tracking_code: str
    status: str


class VacancyOut(BaseModel):
    id: int
    title: str
    region: str
    department: str
    requirements: str


class DocumentOut(BaseModel):
    id: int
    title: str
    document_type: str
    file_url: str


class RegionOfficeOut(BaseModel):
    id: int
    region: str
    address: str
    phone: str
    email: EmailStr
    latitude: str | None
    longitude: str | None
