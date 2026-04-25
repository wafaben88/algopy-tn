"""Section CRUD + reordering."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify

from ..extensions import db
from ..models import Chapter, Section
from ..schemas import ReorderPayload, SectionPayload
from ..services.auth import admin_required
from ._helpers import get_json_payload

bp = Blueprint("sections", __name__)


@bp.post("/")
@admin_required
def create_section():
    payload = get_json_payload(SectionPayload)
    chapter = db.session.get(Chapter, payload.chapter_id)
    if chapter is None:
        abort(404, description="Chapter not found.")
    section = Section(chapter_id=chapter.id, title=payload.title, order=payload.order)
    db.session.add(section)
    db.session.commit()
    return jsonify(section=section.to_dict()), 201


@bp.patch("/<int:section_id>")
@admin_required
def update_section(section_id: int):
    section = db.session.get(Section, section_id)
    if section is None:
        abort(404, description="Section not found.")
    payload = get_json_payload(SectionPayload)
    if payload.chapter_id != section.chapter_id:
        chapter = db.session.get(Chapter, payload.chapter_id)
        if chapter is None:
            abort(404, description="Chapter not found.")
        section.chapter_id = payload.chapter_id
    section.title = payload.title
    section.order = payload.order
    db.session.commit()
    return jsonify(section=section.to_dict()), 200


@bp.delete("/<int:section_id>")
@admin_required
def delete_section(section_id: int):
    section = db.session.get(Section, section_id)
    if section is None:
        abort(404, description="Section not found.")
    db.session.delete(section)
    db.session.commit()
    return ("", 204)


@bp.post("/reorder")
@admin_required
def reorder_sections():
    payload = get_json_payload(ReorderPayload)
    ids = {item.id: item.order for item in payload.items}
    sections = db.session.query(Section).filter(Section.id.in_(ids.keys())).all()
    for section in sections:
        section.order = ids[section.id]
    db.session.commit()
    return jsonify(updated=len(sections)), 200
