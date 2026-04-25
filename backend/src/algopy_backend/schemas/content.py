from __future__ import annotations

from pydantic import BaseModel, Field


class ChapterPayload(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    order: int = 0
    is_published: bool = False


class SectionPayload(BaseModel):
    chapter_id: int
    title: str = Field(min_length=1, max_length=200)
    order: int = 0


class LessonPayload(BaseModel):
    section_id: int
    title: str = Field(min_length=1, max_length=200)
    theory_content: str = ""
    order: int = 0
    is_published: bool = False


class ReorderItem(BaseModel):
    id: int
    order: int


class ReorderPayload(BaseModel):
    items: list[ReorderItem] = Field(min_length=1)
