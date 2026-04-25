"""Custom Flask CLI commands."""

from __future__ import annotations

import click
from flask import Flask
from flask.cli import with_appcontext

from .extensions import db
from .models import User, UserRole
from .services.passwords import hash_password


@click.command("init-db")
@with_appcontext
def init_db_command() -> None:
    """Create all tables (use Flask-Migrate for incremental schema changes)."""
    db.create_all()
    click.echo("Database tables created.")


@click.command("create-admin")
@click.option("--email", required=False, help="Admin email (overrides INITIAL_ADMIN_EMAIL).")
@click.option("--name", required=False, help="Admin display name.")
@click.option(
    "--password",
    required=False,
    help="Admin password (overrides INITIAL_ADMIN_PASSWORD).",
)
@with_appcontext
def create_admin_command(email: str | None, name: str | None, password: str | None) -> None:
    """Create or promote an admin user.

    Reads defaults from INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME,
    INITIAL_ADMIN_PASSWORD env vars. Password must be provided.
    """
    from flask import current_app

    settings = current_app.config["SETTINGS"]
    email = (email or settings.initial_admin_email).lower()
    name = name or settings.initial_admin_name
    password = password or settings.initial_admin_password
    if not password:
        raise click.ClickException(
            "No password provided. Use --password or set INITIAL_ADMIN_PASSWORD."
        )

    user = db.session.query(User).filter_by(email=email).one_or_none()
    if user is None:
        user = User(
            email=email,
            name=name,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
        )
        db.session.add(user)
        click.echo(f"Created admin: {email}")
    else:
        user.password_hash = hash_password(password)
        user.role = UserRole.ADMIN
        user.name = name
        click.echo(f"Promoted to admin and reset password: {email}")
    db.session.commit()


def cli() -> None:
    """Entry point for `algopy-backend` console script (placeholder)."""
    click.echo("Use `flask --app algopy_backend <command>`")


def register_cli(app: Flask) -> None:
    app.cli.add_command(init_db_command)
    app.cli.add_command(create_admin_command)
