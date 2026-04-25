"""Blueprint registration."""

from __future__ import annotations

from flask import Flask

from .ai import bp as ai_bp
from .auth import bp as auth_bp
from .chapters import bp as chapters_bp
from .exercises import bp as exercises_bp
from .images import bp as images_bp
from .lessons import bp as lessons_bp
from .progress import bp as progress_bp
from .sections import bp as sections_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(chapters_bp, url_prefix="/api/chapters")
    app.register_blueprint(sections_bp, url_prefix="/api/sections")
    app.register_blueprint(lessons_bp, url_prefix="/api/lessons")
    app.register_blueprint(exercises_bp, url_prefix="/api/exercises")
    app.register_blueprint(images_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")
