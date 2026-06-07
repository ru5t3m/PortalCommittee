import enum
from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Role(str, enum.Enum):
    admin = "admin"
    moderator = "moderator"
    candidate = "candidate"


class Status(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class AppealStatus(str, enum.Enum):
    received = "received"
    in_review = "in_review"
    answered = "answered"
    rejected = "rejected"


class CandidateStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telegram_id: Mapped[str | None] = mapped_column(String(40), unique=True, index=True, nullable=True)
    telegram_username: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(60), index=True, nullable=True)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.candidate)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    failed_login_count: Mapped[int] = mapped_column(Integer, default=0)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    password_changed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    candidate_application: Mapped["CandidateApplication | None"] = relationship(back_populates="user", uselist=False)
    refresh_sessions: Mapped[list["RefreshSession"]] = relationship(back_populates="user")


class TelegramLoginChallenge(Base, TimestampMixin):
    __tablename__ = "telegram_login_challenges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nonce: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    telegram_id: Mapped[str | None] = mapped_column(String(40), index=True, nullable=True)
    telegram_username: Mapped[str | None] = mapped_column(String(120), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(60), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    created_ip: Mapped[str | None] = mapped_column(String(80), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)


class News(Base, TimestampMixin):
    __tablename__ = "news"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title_kk: Mapped[str] = mapped_column(String(300))
    title_ru: Mapped[str] = mapped_column(String(300))
    summary_kk: Mapped[str] = mapped_column(Text)
    summary_ru: Mapped[str] = mapped_column(Text)
    body_kk: Mapped[str] = mapped_column(Text)
    body_ru: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(120), index=True)
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.draft)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Page(Base, TimestampMixin):
    __tablename__ = "pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title_kk: Mapped[str] = mapped_column(String(300))
    title_ru: Mapped[str] = mapped_column(String(300))
    body_kk: Mapped[str] = mapped_column(Text)
    body_ru: Mapped[str] = mapped_column(Text)
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.draft)


class Appeal(Base, TimestampMixin):
    __tablename__ = "appeals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tracking_code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    iin: Mapped[str | None] = mapped_column(String(12), nullable=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str] = mapped_column(String(60))
    subject: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[AppealStatus] = mapped_column(Enum(AppealStatus), default=AppealStatus.received)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    assigned_to: Mapped[User | None] = relationship()


class CandidateApplication(Base, TimestampMixin):
    __tablename__ = "candidate_applications"
    __table_args__ = (UniqueConstraint("user_id", name="uq_candidate_applications_user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    tracking_code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(120))
    last_name: Mapped[str] = mapped_column(String(120))
    middle_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    iin: Mapped[str | None] = mapped_column(String(12), nullable=True, index=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    phone: Mapped[str] = mapped_column(String(60), index=True)
    region: Mapped[str | None] = mapped_column(String(160), nullable=True)
    education_level: Mapped[str | None] = mapped_column(String(160), nullable=True)
    desired_direction: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[CandidateStatus] = mapped_column(Enum(CandidateStatus), default=CandidateStatus.submitted)
    moderator_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship(back_populates="candidate_application")


class RefreshSession(Base, TimestampMixin):
    __tablename__ = "refresh_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_ip: Mapped[str | None] = mapped_column(String(80), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped[User] = relationship(back_populates="refresh_sessions")


class LoginAttempt(Base, TimestampMixin):
    __tablename__ = "login_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    ip_address: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reason: Mapped[str | None] = mapped_column(String(120), nullable=True)
    user: Mapped[User | None] = relationship()


class RegionOffice(Base, TimestampMixin):
    __tablename__ = "region_offices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    region: Mapped[str] = mapped_column(String(160), index=True)
    address: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[str | None] = mapped_column(String(40), nullable=True)
    longitude: Mapped[str | None] = mapped_column(String(40), nullable=True)


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(120))
    entity: Mapped[str] = mapped_column(String(120))
    entity_id: Mapped[str] = mapped_column(String(80))
    ip_address: Mapped[str | None] = mapped_column(String(80), nullable=True)
    actor: Mapped[User | None] = relationship()
