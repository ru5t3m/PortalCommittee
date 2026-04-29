import enum
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Role(str, enum.Enum):
    admin = "Admin"
    editor = "Editor"
    hr = "HR"
    moderator = "Moderator"


class Status(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class AppealStatus(str, enum.Enum):
    received = "received"
    in_review = "in_review"
    answered = "answered"
    rejected = "rejected"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.editor)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)


class News(Base, TimestampMixin):
    __tablename__ = "news"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title_kk: Mapped[str] = mapped_column(String(300))
    title_ru: Mapped[str] = mapped_column(String(300))
    title_en: Mapped[str] = mapped_column(String(300))
    summary_kk: Mapped[str] = mapped_column(Text)
    summary_ru: Mapped[str] = mapped_column(Text)
    summary_en: Mapped[str] = mapped_column(Text)
    body_kk: Mapped[str] = mapped_column(Text)
    body_ru: Mapped[str] = mapped_column(Text)
    body_en: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(120), index=True)
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.draft)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Page(Base, TimestampMixin):
    __tablename__ = "pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title_kk: Mapped[str] = mapped_column(String(300))
    title_ru: Mapped[str] = mapped_column(String(300))
    title_en: Mapped[str] = mapped_column(String(300))
    body_kk: Mapped[str] = mapped_column(Text)
    body_ru: Mapped[str] = mapped_column(Text)
    body_en: Mapped[str] = mapped_column(Text)
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


class ThreatReport(Base, TimestampMixin):
    __tablename__ = "threat_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tracking_code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    report_type: Mapped[str] = mapped_column(String(120), index=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text)
    urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[AppealStatus] = mapped_column(Enum(AppealStatus), default=AppealStatus.received)


class Vacancy(Base, TimestampMixin):
    __tablename__ = "vacancies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title_ru: Mapped[str] = mapped_column(String(255))
    title_kk: Mapped[str] = mapped_column(String(255))
    title_en: Mapped[str] = mapped_column(String(255))
    region: Mapped[str] = mapped_column(String(160), index=True)
    department: Mapped[str] = mapped_column(String(160))
    requirements: Mapped[str] = mapped_column(Text)
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.published)


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title_ru: Mapped[str] = mapped_column(String(255))
    title_kk: Mapped[str] = mapped_column(String(255))
    title_en: Mapped[str] = mapped_column(String(255))
    document_type: Mapped[str] = mapped_column(String(100), index=True)
    file_url: Mapped[str] = mapped_column(String(500))
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.published)


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
