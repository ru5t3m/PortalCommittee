from functools import lru_cache
import json
from typing import Any

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "KNB RK Official Portal API"
    environment: str = "development"
    database_url: str = "sqlite:///./knb_portal.dev.db"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_days: int = 14
    cors_origins: list[AnyHttpUrl] | list[str] = ["http://localhost:3000"]
    allowed_hosts: list[str] = ["localhost", "127.0.0.1"]
    rate_limit_per_minute: int = 120
    telegram_bot_token: str = ""
    telegram_bot_username: str = ""
    telegram_webhook_secret: str = ""
    telegram_login_challenge_minutes: int = 10
    admin_portal_allowed_user_email: str = "test@gmail.com"
    admin_panel_email: str = ""
    admin_panel_password_hash: str = ""
    admin_access_token_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator(
        "cors_origins",
        "allowed_hosts",
        mode="before",
    )
    @classmethod
    def parse_list_env(cls, value: Any) -> Any:
        if isinstance(value, int):
            return [str(value)]
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                parsed = json.loads(stripped)
                return [str(item) for item in parsed]
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return value

    def validate_for_startup(self) -> None:
        if self.environment.lower() == "production":
            weak_secrets = {"change-me-in-production", "change-this-secret", "replace-with-strong-secret"}
            if self.jwt_secret in weak_secrets or len(self.jwt_secret) < 32:
                raise RuntimeError("JWT_SECRET must be replaced with a strong production secret")
            if "*" in self.allowed_hosts:
                raise RuntimeError("ALLOWED_HOSTS must not contain '*' in production")
            if "*" in [str(origin) for origin in self.cors_origins]:
                raise RuntimeError("CORS_ORIGINS must not contain '*' in production")
            if not self.telegram_bot_token:
                raise RuntimeError("TELEGRAM_BOT_TOKEN must be configured in production")
            if not self.telegram_bot_username:
                raise RuntimeError("TELEGRAM_BOT_USERNAME must be configured in production")
            if not self.telegram_webhook_secret or len(self.telegram_webhook_secret) < 24:
                raise RuntimeError("TELEGRAM_WEBHOOK_SECRET must be configured with a strong value in production")


@lru_cache
def get_settings() -> Settings:
    return Settings()
