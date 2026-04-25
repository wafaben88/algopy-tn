"""Exercise + correction CRUD."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify

from ..extensions import db
from ..models import Correction, Difficulty, Exercise, ExerciseType, Lesson
from ..schemas import CorrectionPayload, ExercisePayload, ReorderPayload
from ..services.auth import admin_required, current_user, login_required_endpoint
from ._helpers import get_json_payload

bp = Blueprint("exercises", __name__)


def _coerce_type(v: str) -> ExerciseType:
    return ExerciseType(v)


def _coerce_difficulty(v: str) -> Difficulty:
    return Difficulty(v)


@bp.get("/<int:exercise_id>")
@login_required_endpoint
def get_exercise(exercise_id: int):
    user = current_user()
    exercise = db.session.get(Exercise, exercise_id)
    if exercise is None:
        abort(404, description="Exercise not found.")
    if not (user and user.is_admin) and not exercise.is_published:
        abort(404, description="Exercise not found.")
    return jsonify(exercise=exercise.to_dict(include_correction=True)), 200


@bp.post("/")
@admin_required
def create_exercise():
    payload = get_json_payload(ExercisePayload)
    lesson = db.session.get(Lesson, payload.lesson_id)
    if lesson is None:
        abort(404, description="Lesson not found.")
    exercise = Exercise(
        lesson_id=lesson.id,
        statement=payload.statement,
        type=_coerce_type(payload.type),
        difficulty=_coerce_difficulty(payload.difficulty),
        order=payload.order,
        is_published=payload.is_published,
    )
    db.session.add(exercise)
    db.session.commit()
    return jsonify(exercise=exercise.to_dict()), 201


@bp.patch("/<int:exercise_id>")
@admin_required
def update_exercise(exercise_id: int):
    exercise = db.session.get(Exercise, exercise_id)
    if exercise is None:
        abort(404, description="Exercise not found.")
    payload = get_json_payload(ExercisePayload)
    if payload.lesson_id != exercise.lesson_id:
        lesson = db.session.get(Lesson, payload.lesson_id)
        if lesson is None:
            abort(404, description="Lesson not found.")
        exercise.lesson_id = payload.lesson_id
    exercise.statement = payload.statement
    exercise.type = _coerce_type(payload.type)
    exercise.difficulty = _coerce_difficulty(payload.difficulty)
    exercise.order = payload.order
    exercise.is_published = payload.is_published
    db.session.commit()
    return jsonify(exercise=exercise.to_dict()), 200


@bp.delete("/<int:exercise_id>")
@admin_required
def delete_exercise(exercise_id: int):
    exercise = db.session.get(Exercise, exercise_id)
    if exercise is None:
        abort(404, description="Exercise not found.")
    db.session.delete(exercise)
    db.session.commit()
    return ("", 204)


@bp.post("/reorder")
@admin_required
def reorder_exercises():
    payload = get_json_payload(ReorderPayload)
    ids = {item.id: item.order for item in payload.items}
    exercises = db.session.query(Exercise).filter(Exercise.id.in_(ids.keys())).all()
    for exercise in exercises:
        exercise.order = ids[exercise.id]
    db.session.commit()
    return jsonify(updated=len(exercises)), 200


# --- Corrections ---------------------------------------------------------------


@bp.put("/<int:exercise_id>/correction")
@admin_required
def upsert_correction(exercise_id: int):
    exercise = db.session.get(Exercise, exercise_id)
    if exercise is None:
        abort(404, description="Exercise not found.")
    payload = get_json_payload(CorrectionPayload)
    correction = exercise.correction
    if correction is None:
        correction = Correction(exercise_id=exercise.id)
        db.session.add(correction)
    correction.content = payload.content
    correction.pseudocode = payload.pseudocode
    correction.python_code = payload.python_code
    correction.generated_by_ai = False
    db.session.commit()
    return jsonify(correction=correction.to_dict()), 200


@bp.delete("/<int:exercise_id>/correction")
@admin_required
def delete_correction(exercise_id: int):
    exercise = db.session.get(Exercise, exercise_id)
    if exercise is None or exercise.correction is None:
        abort(404, description="Correction not found.")
    db.session.delete(exercise.correction)
    db.session.commit()
    return ("", 204)
