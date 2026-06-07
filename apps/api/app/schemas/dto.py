from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserOut(BaseModel):
    id: int
    email: EmailStr | None
    full_name: str
    role: str
    telegram_username: str | None = None
    phone: str | None = None
    phone_verified: bool = False


class CandidateApplicationOut(BaseModel):
    tracking_code: str
    status: str
    first_name: str
    last_name: str
    middle_name: str | None
    phone: str
    region: str | None
    education_level: str | None
    desired_direction: str | None


class AuthMeOut(BaseModel):
    user: UserOut
    candidate_application: CandidateApplicationOut | None = None


class TelegramLoginStartOut(BaseModel):
    challenge_id: int
    nonce: str
    deep_link: str
    expires_at: datetime


class TelegramLoginStatusOut(BaseModel):
    challenge_id: int
    status: str
    expires_at: datetime
    phone_verified: bool = False


class TelegramLoginCompleteIn(BaseModel):
    challenge_id: int
    nonce: str = Field(min_length=16, max_length=128)


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


class TrackingOut(BaseModel):
    tracking_code: str
    status: str


class AdminDashboardOut(BaseModel):
    actor: UserOut
    news: int
    pages: int
    appeals: int
    candidates: int
    region_offices: int


class AdminAppealOut(BaseModel):
    id: int
    tracking_code: str
    full_name: str
    iin: str | None
    email: EmailStr
    phone: str
    subject: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime


class AdminAppealStatusUpdate(BaseModel):
    status: str = Field(pattern="^(received|in_review|answered|rejected)$")


class AdminCandidateOut(BaseModel):
    id: int
    tracking_code: str
    status: str
    first_name: str
    last_name: str
    middle_name: str | None
    iin: str | None
    birth_date: date | None
    phone: str
    region: str | None
    education_level: str | None
    desired_direction: str | None
    moderator_comment: str | None
    created_at: datetime
    updated_at: datetime
    user: UserOut


class AdminCandidateStatusUpdate(BaseModel):
    status: str = Field(pattern="^(draft|submitted|in_review|approved|rejected)$")
    moderator_comment: str | None = Field(default=None, max_length=4000)


class RegionOfficeOut(BaseModel):
    id: int
    region: str
    address: str
    phone: str
    email: EmailStr
    latitude: str | None
    longitude: str | None
