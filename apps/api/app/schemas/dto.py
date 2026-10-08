from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


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
    can_access_admin: bool = False


class PsychologicalTestSectionResult(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=255)
    total_questions: int = Field(ge=0, le=500)
    answered_questions: int = Field(ge=0, le=500)
    scored_questions: int = Field(default=0, ge=0, le=500)
    correct_answers: int = Field(default=0, ge=0, le=500)
    score_percent: int = Field(default=0, ge=0, le=100)

class PsychologicalTestSectionInput(PsychologicalTestSectionResult):
    @model_validator(mode="after")
    def validate_counts(self):
        if self.answered_questions > self.total_questions or self.scored_questions > self.total_questions:
            raise ValueError("Section counts cannot exceed total questions")
        if self.correct_answers > min(self.scored_questions, self.answered_questions):
            raise ValueError("Correct answers cannot exceed answered or scored questions")
        return self


class PsychologicalTestResultCreate(BaseModel):
    test_slug: str = Field(min_length=1, max_length=120)
    test_title: str = Field(min_length=1, max_length=255)
    total_questions: int = Field(ge=1, le=500)
    answered_questions: int = Field(ge=0, le=500)
    duration_seconds: int = Field(ge=1, le=24 * 60 * 60)
    remaining_seconds: int = Field(ge=0, le=24 * 60 * 60)
    sections: list[PsychologicalTestSectionInput] = Field(min_length=1, max_length=20)
    answers: dict = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_totals(self):
        if self.answered_questions > self.total_questions:
            raise ValueError("Answered questions cannot exceed total questions")
        if self.remaining_seconds > self.duration_seconds:
            raise ValueError("Remaining time cannot exceed test duration")
        if sum(section.total_questions for section in self.sections) != self.total_questions:
            raise ValueError("Section totals must match the test total")
        if sum(section.answered_questions for section in self.sections) != self.answered_questions:
            raise ValueError("Section answers must match the test total")
        if len({section.id for section in self.sections}) != len(self.sections):
            raise ValueError("Section IDs must be unique")
        return self


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


class PsychologicalTestProgressSave(BaseModel):
    test_slug: str = Field(min_length=1, max_length=120)
    test_title: str = Field(min_length=1, max_length=255)
    total_questions: int = Field(ge=1, le=500)
    answered_questions: int = Field(ge=0, le=500)
    current_section_index: int = Field(ge=0, le=20)
    sections: list[PsychologicalTestSectionInput] = Field(min_length=1, max_length=20)
    answers: dict = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_totals(self):
        if self.answered_questions > self.total_questions:
            raise ValueError("Answered questions cannot exceed total questions")
        if self.current_section_index >= len(self.sections):
            raise ValueError("Current section must exist")
        if sum(section.total_questions for section in self.sections) != self.total_questions:
            raise ValueError("Section totals must match the test total")
        if sum(section.answered_questions for section in self.sections) != self.answered_questions:
            raise ValueError("Section answers must match the test total")
        if len({section.id for section in self.sections}) != len(self.sections):
            raise ValueError("Section IDs must be unique")
        return self


class PsychologicalTestProgressOut(BaseModel):
    id: int
    test_slug: str
    test_title: str
    total_questions: int
    answered_questions: int
    current_section_index: int
    sections: list[PsychologicalTestSectionResult]
    answers: dict
    updated_at: datetime


class AdminPsychologicalTestResultOut(PsychologicalTestResultOut):
    answer_key: dict = Field(default_factory=dict)
    user: UserOut
    candidate_application: CandidateApplicationOut | None = None
    answers: dict = Field(default_factory=dict)


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


class EdsLoginStartOut(BaseModel):
    challenge_id: int
    nonce: str
    challenge_text: str
    challenge_base64: str
    expires_at: datetime


class EdsLoginCompleteIn(BaseModel):
    challenge_id: int
    nonce: str = Field(min_length=16, max_length=128)
    cms_base64: str = Field(min_length=64, max_length=200000)


class PasswordRegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    first_name: str = Field(min_length=2, max_length=120)
    last_name: str = Field(min_length=2, max_length=120)
    birth_date: date | None = None
    phone: str = Field(min_length=5, max_length=60)

    @field_validator("first_name", "last_name", "phone", mode="before")
    @classmethod
    def strip_profile_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, value):
        if value is not None and value > date.today():
            raise ValueError("Birth date cannot be in the future")
        return value


class PasswordLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AdminPanelLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AppealCreate(BaseModel):
    full_name: str = Field(min_length=3, max_length=255)
    iin: str | None = Field(default=None, min_length=12, max_length=12)
    email: EmailStr
    phone: str = Field(min_length=5, max_length=60)
    subject: str = Field(min_length=5, max_length=255)
    message: str = Field(min_length=20, max_length=8000)

    @field_validator("full_name", "phone", "subject", "message", mode="before")
    @classmethod
    def strip_appeal_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("iin")
    @classmethod
    def validate_iin(cls, value):
        if value is not None and (not value.isascii() or not value.isdigit()):
            raise ValueError("IIN must contain 12 digits")
        return value


class TrackingOut(BaseModel):
    tracking_code: str
    status: str


class AdminDashboardOut(BaseModel):
    actor: UserOut
    users: int
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
    service: str
    name_ru: str
    name_kk: str
    region_ru: str
    region_kk: str
    phones: list[str]
    latitude: str
    longitude: str


class FaqAssistantRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    locale: str = Field(default="ru", pattern="^(ru|kk)$")


class FaqAssistantSuggestion(BaseModel):
    question: str
    section: str


class FaqAssistantResponse(BaseModel):
    answer: str | None
    matched_question: str | None
    section: str | None
    confidence: float
    source: str
    llm_used: bool = False
    suggestions: list[FaqAssistantSuggestion] = Field(default_factory=list)


class RegionOfficeCreate(BaseModel):
    service: str = Field(pattern="^(knb|border)$")
    name_ru: str = Field(min_length=2, max_length=255)
    name_kk: str = Field(min_length=2, max_length=255)
    region_ru: str = Field(min_length=2, max_length=160)
    region_kk: str = Field(min_length=2, max_length=160)
    phones: list[str] = Field(min_length=1, max_length=10)
    latitude: str = Field(min_length=1, max_length=40)
    longitude: str = Field(min_length=1, max_length=40)


class RegionOfficeUpdate(RegionOfficeCreate):
    pass
