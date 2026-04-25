"""Shared helpers for blueprints."""

from __future__ import annotations

from typing import TypeVar

from flask import abort, request
from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


def get_json_payload(model: type[T]) -> T:
    raw = request.get_json(silent=True)
    if raw is None:
        abort(400, description="Expected JSON body.")
    try:
        return model.model_validate(raw)
    except ValidationError as e:
        abort(400, description=e.json())
