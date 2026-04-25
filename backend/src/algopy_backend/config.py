"""Centralised, type-checked configuration.

Loaded once at app-creation time from environment variables (or `.env` in
local dev via Flask's built-in dotenv support). Pydantic gives us validation,
defaults, and editor autocompletion.
"""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Flask
    flask_env: str = "production"
    secret_key: str = Field(default="dev-secret-change-me", min_length=8)
    jwt_secret_key: str = Field(default="dev-jwt-change-me", min_length=8)

    # DB
    database_url: str = "sqlite:///instance/algopy.db"

    # Uploads
    upload_dir: Path = Path("./uploads")
    max_upload_bytes: int = 10 * 1024 * 1024  # 10 MiB

    # Image protection
    secure_image_ttl: int = 300  # seconds

    # AI
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"

    # CORS — comma-separated list, parsed lazily
    cors_origins: str = "http://localhost:3000"

    # Admin bootstrap
    initial_admin_email: str = "admin@algopy.tn"
    initial_admin_password: str | None = None
    initial_admin_name: str = "Admin"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_dev(self) -> bool:
        return self.flask_env == "development"


def load_settings() -> Settings:
    return Settings()
