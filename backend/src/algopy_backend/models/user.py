"""Users + roles."""

from __future__ import annotations

import enum

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ._base import Base, TimestampMixin


class UserRole(enum.StrEnum):
    ADMIN = "admin"
    STUDENT = "student"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, native_enum=False, length=20),
        default=UserRole.STUDENT,
        nullable=False,
    )

    progress = relationship(
        "UserProgress", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    def to_public_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role.value,
            "created_at": self.created_at.isoformat(),
        }
