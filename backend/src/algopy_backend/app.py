"""Flask application factory."""

from __future__ import annotations

import logging
from pathlib import Path

from flask import Flask, jsonify

from .cli import register_cli
from .config import Settings, load_settings
from .extensions import cors, db, jwt, migrate
from .routes import register_blueprints


def create_app(settings: Settings | None = None) -> Flask:
    settings = settings or load_settings()

    app = Flask(__name__, instance_relative_config=True)
    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    app.config.update(
        SECRET_KEY=settings.secret_key,
        SQLALCHEMY_DATABASE_URI=_resolve_database_url(settings.database_url, app.instance_path),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=settings.jwt_secret_key,
        JWT_ACCESS_TOKEN_EXPIRES=60 * 60 * 24,  # 24h
        JWT_REFRESH_TOKEN_EXPIRES=60 * 60 * 24 * 30,  # 30 days
        MAX_CONTENT_LENGTH=settings.max_upload_bytes,
        SETTINGS=settings,
    )

    # Resolve upload_dir to an absolute path so it doesn't depend on the cwd.
    settings.upload_dir = settings.upload_dir.resolve()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": settings.cors_origin_list}},
        supports_credentials=False,
    )

    # Models must be imported before db.create_all / migrations resolve them.
    from . import models  # noqa: F401

    register_blueprints(app)
    register_cli(app)
    register_error_handlers(app)

    @app.get("/api/health")
    def health() -> tuple[dict, int]:
        return {"status": "ok"}, 200

    if settings.is_dev:
        logging.basicConfig(level=logging.INFO)

    return app


def _resolve_database_url(url: str, instance_path: str) -> str:
    """Make SQLite URLs absolute against the Flask `instance/` folder."""
    if url.startswith("sqlite:///") and not url.startswith("sqlite:////"):
        relative = url.removeprefix("sqlite:///")
        if not relative.startswith("/"):
            return f"sqlite:///{Path(instance_path) / relative}"
    return url


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(400)
    def bad_request(e):  # type: ignore[no-untyped-def]
        return jsonify(error="bad_request", message=str(e.description)), 400

    @app.errorhandler(401)
    def unauthorized(e):  # type: ignore[no-untyped-def]
        return jsonify(error="unauthorized", message=str(e.description)), 401

    @app.errorhandler(403)
    def forbidden(e):  # type: ignore[no-untyped-def]
        return jsonify(error="forbidden", message=str(e.description)), 403

    @app.errorhandler(404)
    def not_found(e):  # type: ignore[no-untyped-def]
        return jsonify(error="not_found", message=str(e.description)), 404

    @app.errorhandler(413)
    def too_large(e):  # type: ignore[no-untyped-def]
        return jsonify(error="payload_too_large", message="File exceeds maximum size."), 413

    @app.errorhandler(500)
    def server_error(e):  # type: ignore[no-untyped-def]
        app.logger.exception("Server error")
        return jsonify(error="server_error", message="Internal server error."), 500
