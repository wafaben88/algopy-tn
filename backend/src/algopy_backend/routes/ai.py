"""AI-powered generation: exercises + corrections."""

from __future__ import annotations

from flask import Blueprint, abort, jsonify

from ..extensions import db
from ..models import Correction, Difficulty, Exercise, ExerciseType, Lesson
from ..schemas import GenerateCorrectionPayload, GenerateExercisesPayload
from ..services.auth import admin_required
from ..services.gemini import GeminiError, generate_correction, generate_exercises
from ._helpers import get_json_payload

bp = Blueprint("ai", __name__)


@bp.post("/lessons/<int:lesson_id>/generate-exercises")
@admin_required
def gen_exercises(lesson_id: int):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        abort(404, description="Lesson not found.")
    payload = get_json_payload(GenerateExercisesPayload)
    try:
        items = generate_exercises(
            lesson_title=lesson.title,
            lesson_theory=lesson.theory_content,
            n=payload.n,
            level=payload.level,
            ex_type=payload.type,
        )
    except GeminiError as e:
        abort(502, description=str(e))

    created: list[Exercise] = []
    base_order = (
        db.session.query(Exercise)
        .filter_by(lesson_id=lesson.id)
        .count()
    )
    for i, item in enumerate(items):
        try:
            ex_type = ExerciseType(item["type"])
        except ValueError:
            ex_type = ExerciseType.ALGORITHM
        try:
            diff = Difficulty(item["difficulty"])
        except ValueError:
            diff = Difficulty.EASY
        ex = Exercise(
            lesson_id=lesson.id,
            statement=item["statement"],
            type=ex_type,
            difficulty=diff,
            order=base_order + i,
            generated_by_ai=True,
            is_published=False,
        )
        db.session.add(ex)
        created.append(ex)
    db.session.commit()
    return jsonify(exercises=[e.to_dict() for e in created]), 201


@bp.post("/exercises/<int:exercise_id>/generate-correction")
@admin_required
def gen_correction(exercise_id: int):
    exercise = db.session.get(Exercise, exercise_id)
    if exercise is None:
        abort(404, description="Exercise not found.")
    payload = get_json_payload(GenerateCorrectionPayload)
    try:
        result = generate_correction(
            statement=exercise.statement,
            ex_type=exercise.type.value,
        )
    except GeminiError as e:
        abort(502, description=str(e))

    if not payload.persist:
        return jsonify(correction=result, persisted=False), 200

    correction = exercise.correction
    if correction is None:
        correction = Correction(exercise_id=exercise.id)
        db.session.add(correction)
    correction.content = result["content"]
    correction.pseudocode = result["pseudocode"]
    correction.python_code = result["python_code"]
    correction.generated_by_ai = True
    db.session.commit()
    return jsonify(correction=correction.to_dict(), persisted=True), 200
