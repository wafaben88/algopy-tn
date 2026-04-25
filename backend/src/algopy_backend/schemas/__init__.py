"""Pydantic schemas for request validation."""

from .auth import LoginPayload, RegisterPayload
from .content import (
    ChapterPayload,
    LessonPayload,
    ReorderPayload,
    SectionPayload,
)
from .exercise import (
    CorrectionPayload,
    ExercisePayload,
    GenerateCorrectionPayload,
    GenerateExercisesPayload,
)

__all__ = [
    "LoginPayload",
    "RegisterPayload",
    "ChapterPayload",
    "SectionPayload",
    "LessonPayload",
    "ReorderPayload",
    "ExercisePayload",
    "CorrectionPayload",
    "GenerateExercisesPayload",
    "GenerateCorrectionPayload",
]
