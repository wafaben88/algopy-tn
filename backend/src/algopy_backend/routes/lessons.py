"""Lesson CRUD, image upload, image-token issuing."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify, request
from flask_jwt_extended import verify_jwt_in_request

from ..extensions import db
from ..models import Lesson, LessonImage, Section
from ..schemas import LessonPayload, ReorderPayload
from ..services.auth import admin_required, current_user, login_required_endpoint
from ..services.images import (
    ImageError,
    issue_image_token,
    store_uploaded_image,
)
from ._helpers import get_json_payload

bp = Blueprint("lessons", __name__)


def _can_view_lesson(lesson: Lesson) -> bool:
    user = current_user()
    if user is not None and user.is_admin:
        return True
    return lesson.is_published and lesson.section.chapter.is_published


def _serialize_lesson_with_tokens(lesson: Lesson) -> dict:
    """Lesson dict with a fresh image token for each protected image."""
    user = current_user()
    user_id = user.id if user else 0
    data = lesson.to_dict(include_images=True, include_exercises=True)
    for img_dict, img in zip(data["images"], lesson.images):
        img_dict["token"] = issue_image_token(img, user_id)
    return data


@bp.get("/<int:lesson_id>")
def get_lesson(lesson_id: int):
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        abort(404, description="Lesson not found.")
    if not _can_view_lesson(lesson):
        abort(404, description="Lesson not found.")
    return jsonify(lesson=_serialize_lesson_with_tokens(lesson)), 200


@bp.post("/")
@admin_required
def create_lesson():
    payload = get_json_payload(LessonPayload)
    section = db.session.get(Section, payload.section_id)
    if section is None:
        abort(404, description="Section not found.")
    lesson = Lesson(
        section_id=section.id,
        title=payload.title,
        theory_content=payload.theory_content,
        order=payload.order,
        is_published=payload.is_published,
    )
    db.session.add(lesson)
    db.session.commit()
    return jsonify(lesson=lesson.to_dict()), 201


@bp.patch("/<int:lesson_id>")
@admin_required
def update_lesson(lesson_id: int):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        abort(404, description="Lesson not found.")
    payload = get_json_payload(LessonPayload)
    if payload.section_id != lesson.section_id:
        section = db.session.get(Section, payload.section_id)
        if section is None:
            abort(404, description="Section not found.")
        lesson.section_id = payload.section_id
    lesson.title = payload.title
    lesson.theory_content = payload.theory_content
    lesson.order = payload.order
    lesson.is_published = payload.is_published
    db.session.commit()
    return jsonify(lesson=lesson.to_dict()), 200


@bp.delete("/<int:lesson_id>")
@admin_required
def delete_lesson(lesson_id: int):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        abort(404, description="Lesson not found.")
    db.session.delete(lesson)
    db.session.commit()
    return ("", 204)


@bp.post("/reorder")
@admin_required
def reorder_lessons():
    payload = get_json_payload(ReorderPayload)
    ids = {item.id: item.order for item in payload.items}
    lessons = db.session.query(Lesson).filter(Lesson.id.in_(ids.keys())).all()
    for lesson in lessons:
        lesson.order = ids[lesson.id]
    db.session.commit()
    return jsonify(updated=len(lessons)), 200


# --- Image upload (admin only) -------------------------------------------------


@bp.post("/<int:lesson_id>/images")
@admin_required
def upload_lesson_image(lesson_id: int):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        abort(404, description="Lesson not found.")
    file = request.files.get("file")
    if file is None:
        abort(400, description="Missing 'file' multipart field.")
    try:
        info = store_uploaded_image(file, lesson)
    except ImageError as e:
        abort(400, description=str(e))
    next_order = (
        db.session.query(LessonImage)
        .filter_by(lesson_id=lesson.id)
        .count()
    )
    image = LessonImage(
        lesson_id=lesson.id,
        display_order=next_order,
        is_protected=True,
        **info,
    )
    db.session.add(image)
    db.session.commit()
    payload = image.to_public_dict()
    user = current_user()
    payload["token"] = issue_image_token(image, user.id if user else 0)
    return jsonify(image=payload), 201


@bp.delete("/<int:lesson_id>/images/<int:image_id>")
@admin_required
def delete_lesson_image(lesson_id: int, image_id: int):
    image = db.session.get(LessonImage, image_id)
    if image is None or image.lesson_id != lesson_id:
        abort(404, description="Image not found.")
    db.session.delete(image)
    db.session.commit()
    return ("", 204)


@bp.post("/<int:lesson_id>/images/reorder")
@admin_required
def reorder_lesson_images(lesson_id: int):
    payload = get_json_payload(ReorderPayload)
    ids = {item.id: item.order for item in payload.items}
    images = (
        db.session.query(LessonImage)
        .filter(LessonImage.id.in_(ids.keys()), LessonImage.lesson_id == lesson_id)
        .all()
    )
    for image in images:
        image.display_order = ids[image.id]
    db.session.commit()
    return jsonify(updated=len(images)), 200


# --- Token refresh (for already-issued image ids) ------------------------------


@bp.get("/<int:lesson_id>/images/<int:image_id>/token")
@login_required_endpoint
def issue_token(lesson_id: int, image_id: int):
    image = db.session.get(LessonImage, image_id)
    if image is None or image.lesson_id != lesson_id:
        abort(404, description="Image not found.")
    lesson = image.lesson
    if not _can_view_lesson(lesson):
        abort(403, description="No access to this lesson.")
    user = current_user()
    return jsonify(token=issue_image_token(image, user.id if user else 0)), 200
