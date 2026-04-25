"""Per-user progress."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from ..extensions import db
from ..models import Lesson, UserProgress
from ..services.auth import current_user, login_required_endpoint

bp = Blueprint("progress", __name__)


@bp.get("/")
@login_required_endpoint
def list_progress():
    user = current_user()
    assert user is not None
    rows = db.session.query(UserProgress).filter_by(user_id=user.id).all()
    return jsonify(progress=[r.to_dict() for r in rows]), 200


@bp.post("/lessons/<int:lesson_id>")
@login_required_endpoint
def record_progress(lesson_id: int):
    user = current_user()
    assert user is not None
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        abort(404, description="Lesson not found.")

    body = request.get_json(silent=True) or {}
    completed = bool(body.get("completed", True))
    score = int(body.get("score", 0))

    record = (
        db.session.query(UserProgress)
        .filter_by(user_id=user.id, lesson_id=lesson.id)
        .one_or_none()
    )
    if record is None:
        record = UserProgress(user_id=user.id, lesson_id=lesson.id)
        db.session.add(record)
    record.completed = completed or record.completed
    record.score = max(record.score, score)
    db.session.commit()
    return jsonify(progress=record.to_dict()), 200
