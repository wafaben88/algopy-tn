"""Per-user, per-lesson progress."""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ._base import Base, TimestampMixin


class UserProgress(Base, TimestampMixin):
    __tablename__ = "user_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_progress_user_lesson"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress_records")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "lesson_id": self.lesson_id,
            "completed": self.completed,
            "score": self.score,
            "updated_at": self.updated_at.isoformat(),
        }
