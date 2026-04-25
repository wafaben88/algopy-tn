"""Chapter CRUD + reordering."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify
from flask_jwt_extended import verify_jwt_in_request

from ..extensions import db
from ..models import Chapter
from ..schemas import ChapterPayload, ReorderPayload
from ..services.auth import admin_required, current_user
from ._helpers import get_json_payload

bp = Blueprint("chapters", __name__)


@bp.get("/")
def list_chapters():
    """List chapters. Admins see drafts; students only published.

    Auth is optional (JWT, but tolerated when missing).
    """
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass
    user = current_user()
    q = db.session.query(Chapter).order_by(Chapter.order.asc(), Chapter.id.asc())
    if user is None or not user.is_admin:
        q = q.filter(Chapter.is_published.is_(True))
    chapters = q.all()
    return jsonify(chapters=[c.to_dict(include_sections=True) for c in chapters]), 200


@bp.get("/<int:chapter_id>")
def get_chapter(chapter_id: int):
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass
    user = current_user()
    chapter = db.session.get(Chapter, chapter_id)
    if chapter is None:
        abort(404, description="Chapter not found.")
    if (user is None or not user.is_admin) and not chapter.is_published:
        abort(404, description="Chapter not found.")
    return jsonify(chapter=chapter.to_dict(include_sections=True)), 200


@bp.post("/")
@admin_required
def create_chapter():
    payload = get_json_payload(ChapterPayload)
    chapter = Chapter(
        title=payload.title,
        description=payload.description,
        order=payload.order,
        is_published=payload.is_published,
    )
    db.session.add(chapter)
    db.session.commit()
    return jsonify(chapter=chapter.to_dict()), 201


@bp.patch("/<int:chapter_id>")
@admin_required
def update_chapter(chapter_id: int):
    chapter = db.session.get(Chapter, chapter_id)
    if chapter is None:
        abort(404, description="Chapter not found.")
    payload = get_json_payload(ChapterPayload)
    chapter.title = payload.title
    chapter.description = payload.description
    chapter.order = payload.order
    chapter.is_published = payload.is_published
    db.session.commit()
    return jsonify(chapter=chapter.to_dict()), 200


@bp.delete("/<int:chapter_id>")
@admin_required
def delete_chapter(chapter_id: int):
    chapter = db.session.get(Chapter, chapter_id)
    if chapter is None:
        abort(404, description="Chapter not found.")
    db.session.delete(chapter)
    db.session.commit()
    return ("", 204)


@bp.post("/reorder")
@admin_required
def reorder_chapters():
    payload = get_json_payload(ReorderPayload)
    ids = {item.id: item.order for item in payload.items}
    chapters = db.session.query(Chapter).filter(Chapter.id.in_(ids.keys())).all()
    for chapter in chapters:
        chapter.order = ids[chapter.id]
    db.session.commit()
    return jsonify(updated=len(chapters)), 200
