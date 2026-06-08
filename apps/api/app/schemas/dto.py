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


class PsychologicalTestSectionResult(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=255)
    total_questions: int = Field(ge=0, le=500)
    answered_questions: int = Field(ge=0, le=500)


class PsychologicalTestResultCreate(BaseModel):
    test_slug: str = Field(min_length=1, max_length=120)
    test_title: str = Field(min_length=1, max_length=255)
    total_questions: int = Field(ge=1, le=500)
    answered_questions: int = Field(ge=0, le=500)
    duration_seconds: int = Field(ge=1, le=24 * 60 * 60)
    remaining_seconds: int = Field(ge=0, le=24 * 60 * 60)
    sections: list[PsychologicalTestSectionResult] = Field(min_length=1, max_length=20)
    answers: dict = Field(default_factory=dict)


class PsychologicalTestResultOut(BaseModel):
    id: int
    test_slug: str
    test_title: str
    total_questions: int
    answered_questions: int
    duration_seconds: int
    remaining_seconds: int
    sections: list[PsychologicalTestSectionResult]
    submitted_at: datetime


class AdminPsychologicalTestResultOut(PsychologicalTestResultOut):
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


class PasswordRegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    first_name: str = Field(min_length=2, max_length=120)
    last_name: str = Field(min_length=2, max_length=120)
    birth_date: date | None = None
    phone: str = Field(min_length=5, max_length=60)


class PasswordLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AdminPanelLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


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
    users: int
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
