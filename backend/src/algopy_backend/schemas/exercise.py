from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ExercisePayload(BaseModel):
    lesson_id: int
    statement: str = Field(min_length=1)
    type: Literal["algorithm", "python", "mixed"] = "algorithm"
    difficulty: Literal["easy", "medium", "hard"] = "easy"
    order: int = 0
    is_published: bool = False


class CorrectionPayload(BaseModel):
    content: str = ""
    pseudocode: str | None = None
    python_code: str | None = None


class GenerateExercisesPayload(BaseModel):
    n: int = Field(default=3, ge=1, le=10)
    level: str = "lycée — 2ème info"
    type: Literal["algorithm", "python", "mixed"] = "mixed"


class GenerateCorrectionPayload(BaseModel):
    # If True, persist the generated correction (overwriting any existing one).
    persist: bool = True
