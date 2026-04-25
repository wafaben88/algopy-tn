"""Course-content hierarchy: Chapter > Section > Lesson > LessonImage."""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ._base import Base, TimestampMixin


class Chapter(Base, TimestampMixin):
    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    sections = relationship(
        "Section",
        back_populates="chapter",
        cascade="all, delete-orphan",
        order_by="Section.order",
    )

    def to_dict(self, *, include_sections: bool = False) -> dict:
        data: dict = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "order": self.order,
            "is_published": self.is_published,
        }
        if include_sections:
            data["sections"] = [s.to_dict(include_lessons=True) for s in self.sections]
        return data


class Section(Base, TimestampMixin):
    __tablename__ = "sections"
    __table_args__ = (UniqueConstraint("chapter_id", "order", name="uq_section_chapter_order"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    chapter_id: Mapped[int] = mapped_column(
        ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)

    chapter = relationship("Chapter", back_populates="sections")
    lessons = relationship(
        "Lesson",
        back_populates="section",
        cascade="all, delete-orphan",
        order_by="Lesson.order",
    )

    def to_dict(self, *, include_lessons: bool = False) -> dict:
        data: dict = {
            "id": self.id,
            "chapter_id": self.chapter_id,
            "title": self.title,
            "order": self.order,
        }
        if include_lessons:
            data["lessons"] = [lsn.to_dict() for lsn in self.lessons]
        return data


class Lesson(Base, TimestampMixin):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    section_id: Mapped[int] = mapped_column(
        ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # Markdown / rich-text body for the theory section.
    theory_content: Mapped[str] = mapped_column(Text, default="", nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    section = relationship("Section", back_populates="lessons")
    images = relationship(
        "LessonImage",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="LessonImage.display_order",
    )
    exercises = relationship(
        "Exercise",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="Exercise.order",
    )
    progress_records = relationship(
        "UserProgress", back_populates="lesson", cascade="all, delete-orphan"
    )

    def to_dict(self, *, include_images: bool = False, include_exercises: bool = False) -> dict:
        data: dict = {
            "id": self.id,
            "section_id": self.section_id,
            "title": self.title,
            "theory_content": self.theory_content,
            "order": self.order,
            "is_published": self.is_published,
        }
        if include_images:
            data["images"] = [img.to_public_dict() for img in self.images]
        if include_exercises:
            data["exercises"] = [
                ex.to_dict(include_correction=True) for ex in self.exercises
            ]
        return data


class LessonImage(Base, TimestampMixin):
    """An image attached to a lesson's theory body.

    The actual file lives under `Settings.upload_dir / stored_path`. Clients
    NEVER receive the file path or a directly-fetchable URL — they receive a
    short-lived JWT token (see `services.images.issue_image_token`) that they
    pass to `/api/secure-image/<token>`. The route streams the bytes only if
    the token is valid, the user is authenticated, and the lesson is
    published or the user is the admin.
    """

    __tablename__ = "lesson_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_path: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    mime_type: Mapped[str] = mapped_column(String(100), default="image/png", nullable=False)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_protected: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    lesson = relationship("Lesson", back_populates="images")

    def to_public_dict(self) -> dict:
        """Public payload — no file path, no URL. Token is issued on demand."""
        return {
            "id": self.id,
            "lesson_id": self.lesson_id,
            "filename": self.filename,
            "mime_type": self.mime_type,
            "width": self.width,
            "height": self.height,
            "display_order": self.display_order,
            "is_protected": self.is_protected,
        }
