"""Secure-image service.

Images uploaded via the admin dashboard are stored under
`Settings.upload_dir / lesson_<id> / <hash>.<ext>`. Their direct paths/URLs
are NEVER exposed to clients. Instead:

1. The admin uploads → we receive multipart, validate it's an image,
   re-encode through Pillow (this strips EXIF + scrubs malicious payloads),
   compute a content hash, store under `lesson_<lesson_id>/<hash>.<ext>`,
   and persist a `LessonImage` row.

2. Whenever a client (admin or authenticated student with access to a
   published lesson) requests lesson data, we attach a freshly-issued
   JWT token (TTL = `Settings.secure_image_ttl`, default 5 min) for each
   image. The token is bound to (image_id, user_id) and signed with
   `JWT_SECRET_KEY`.

3. The client passes the token to `GET /api/secure-image/<token>`. We
   verify the token, re-check ACL (admin or published lesson), then stream
   the bytes with `Cache-Control: no-store`, `Content-Disposition: inline`,
   and `X-Content-Type-Options: nosniff`. The frontend renders the response
   into a `<canvas>` and overlays the user's name as a watermark — never
   into an `<img>` tag.
"""

from __future__ import annotations

import hashlib
import io
import secrets
from datetime import UTC, datetime, timedelta
from pathlib import Path

import jwt as pyjwt
from flask import current_app
from PIL import Image, UnidentifiedImageError
from werkzeug.datastructures import FileStorage

from ..config import Settings
from ..models import Lesson, LessonImage

ALLOWED_FORMATS = {"PNG": "png", "JPEG": "jpg", "WEBP": "webp"}
ALLOWED_MIME = {"png": "image/png", "jpg": "image/jpeg", "webp": "image/webp"}


class ImageError(Exception):
    """Raised on validation / processing errors."""


def _settings() -> Settings:
    return current_app.config["SETTINGS"]


def _lesson_dir(lesson_id: int) -> Path:
    s = _settings()
    p = s.upload_dir / f"lesson_{lesson_id}"
    p.mkdir(parents=True, exist_ok=True)
    return p


def store_uploaded_image(file: FileStorage, lesson: Lesson) -> dict:
    """Validate, re-encode, hash, persist file. Returns dict to construct LessonImage."""
    if file is None or file.filename == "":
        raise ImageError("Empty upload.")
    raw = file.read()
    if not raw:
        raise ImageError("Empty upload.")

    try:
        with Image.open(io.BytesIO(raw)) as probe:
            probe.verify()
    except (UnidentifiedImageError, OSError, ValueError) as e:
        raise ImageError(f"Not a valid image: {e}") from e

    image = Image.open(io.BytesIO(raw))
    fmt = (image.format or "").upper()
    if fmt not in ALLOWED_FORMATS:
        raise ImageError(f"Unsupported image format: {fmt}. Use PNG, JPEG, or WEBP.")
    ext = ALLOWED_FORMATS[fmt]

    # Re-encode through Pillow to strip metadata + malicious payloads.
    buffer = io.BytesIO()
    save_kwargs: dict = {}
    if fmt == "JPEG":
        image = image.convert("RGB")
        save_kwargs = {"quality": 90, "optimize": True}
    elif fmt == "PNG":
        save_kwargs = {"optimize": True}
    image.save(buffer, format=fmt, **save_kwargs)
    cleaned = buffer.getvalue()

    digest = hashlib.sha256(cleaned).hexdigest()[:32]
    rel_path = f"lesson_{lesson.id}/{digest}.{ext}"
    abs_path = _settings().upload_dir / rel_path
    abs_path.parent.mkdir(parents=True, exist_ok=True)
    abs_path.write_bytes(cleaned)

    return {
        "filename": file.filename,
        "stored_path": rel_path,
        "mime_type": ALLOWED_MIME[ext],
        "width": image.width,
        "height": image.height,
    }


def absolute_path_for(image: LessonImage) -> Path:
    """Return the absolute filesystem path for a stored image."""
    return _settings().upload_dir / image.stored_path


def issue_image_token(image: LessonImage, user_id: int) -> str:
    """Issue a short-lived JWT bound to (image_id, user_id, lesson_id)."""
    s = _settings()
    now = datetime.now(UTC)
    payload = {
        "img": image.id,
        "lsn": image.lesson_id,
        "uid": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=s.secure_image_ttl)).timestamp()),
        "jti": secrets.token_urlsafe(8),
    }
    return pyjwt.encode(payload, s.jwt_secret_key, algorithm="HS256")


def decode_image_token(token: str) -> dict:
    """Validate a token and return its payload, or raise jwt errors."""
    s = _settings()
    return pyjwt.decode(token, s.jwt_secret_key, algorithms=["HS256"])
