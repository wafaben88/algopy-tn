"""Exercises and their corrections."""

from __future__ import annotations

import enum

from sqlalchemy import Boolean, ForeignKey, Integer, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ._base import Base, TimestampMixin


class ExerciseType(enum.StrEnum):
    ALGORITHM = "algorithm"  # pseudo-code style
    PYTHON = "python"        # Python code
    MIXED = "mixed"


class Difficulty(enum.StrEnum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Exercise(Base, TimestampMixin):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[ExerciseType] = mapped_column(
        SAEnum(ExerciseType, native_enum=False, length=20),
        default=ExerciseType.ALGORITHM,
        nullable=False,
    )
    difficulty: Mapped[Difficulty] = mapped_column(
        SAEnum(Difficulty, native_enum=False, length=10),
        default=Difficulty.EASY,
        nullable=False,
    )
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    generated_by_ai: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    lesson = relationship("Lesson", back_populates="exercises")
    correction = relationship(
        "Correction",
        back_populates="exercise",
        cascade="all, delete-orphan",
        uselist=False,
    )

    def to_dict(self, *, include_correction: bool = False) -> dict:
        data: dict = {
            "id": self.id,
            "lesson_id": self.lesson_id,
            "statement": self.statement,
            "type": self.type.value,
            "difficulty": self.difficulty.value,
            "order": self.order,
            "generated_by_ai": self.generated_by_ai,
            "is_published": self.is_published,
        }
        if include_correction:
            data["correction"] = self.correction.to_dict() if self.correction else None
        return data


class Correction(Base, TimestampMixin):
    __tablename__ = "corrections"

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    # Free-form pedagogical explanation (markdown).
    content: Mapped[str] = mapped_column(Text, default="", nullable=False)
    pseudocode: Mapped[str | None] = mapped_column(Text, nullable=True)
    python_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_by_ai: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    exercise = relationship("Exercise", back_populates="correction")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "exercise_id": self.exercise_id,
            "content": self.content,
            "pseudocode": self.pseudocode,
            "python_code": self.python_code,
            "generated_by_ai": self.generated_by_ai,
        }
