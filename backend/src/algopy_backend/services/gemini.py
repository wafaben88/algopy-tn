"""Gemini AI integration — generates exercises and corrections.

We use the `google-genai` SDK with structured-JSON output so the model can
only return data that conforms to our schema.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from flask import current_app

from ..config import Settings

logger = logging.getLogger(__name__)


class GeminiError(Exception):
    """Raised when Gemini fails or returns invalid data."""


def _settings() -> Settings:
    return current_app.config["SETTINGS"]


def _client():
    """Lazy-import the SDK so the rest of the app boots without it."""
    from google import genai  # type: ignore[import-untyped]

    s = _settings()
    if not s.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY is not configured.")
    return genai.Client(api_key=s.gemini_api_key)


_EXERCISES_PROMPT = """\
Tu es un professeur d'algorithmique et Python pour des lycéens tunisiens
(programme officiel : 2ème info, 3ème info, Bac informatique). Tu dois
générer {n} exercices originaux, dans le même esprit pédagogique et avec
le même style d'énoncé que le cours ci-dessous.

Contraintes :
- Niveau cible : {level}
- Type d'exercices : {ex_type} (algorithme pseudo-code tunisien, Python, ou mixte)
- Difficulté progressive (du plus simple au plus difficile)
- Énoncés clairs, en français, adaptés aux lycéens
- Pas de copier-coller du cours, mais des exercices nouveaux qui réutilisent les concepts
- Chaque énoncé doit pouvoir être résolu avec ce que le cours présente

Cours (titre + théorie) :
---
{lesson_title}

{lesson_theory}
---

Renvoie UNIQUEMENT un JSON conforme à ce schéma :
{{
  "exercises": [
    {{
      "statement": "...",
      "type": "algorithm" | "python" | "mixed",
      "difficulty": "easy" | "medium" | "hard"
    }}
  ]
}}
"""


_CORRECTION_PROMPT = """\
Tu es un professeur d'algorithmique et Python pour des lycéens tunisiens.
Génère la correction détaillée et pédagogique de cet exercice.

Énoncé :
---
{statement}
---

Type d'exercice : {ex_type}

Inclure obligatoirement :
- Une explication étape par étape (en français, niveau lycée)
- Si pertinent : l'algorithme en pseudo-code tunisien (style "Algorithme ... Début ... Fin")
- Si pertinent : le code Python équivalent, propre et commenté
- Des remarques pédagogiques (pièges, bonnes pratiques)

Renvoie UNIQUEMENT un JSON conforme à ce schéma :
{{
  "content": "explication détaillée en markdown",
  "pseudocode": "algorithme pseudo-code OU null",
  "python_code": "code python OU null"
}}
"""


def _generate_json(prompt: str) -> dict[str, Any]:
    s = _settings()
    client = _client()
    try:
        response = client.models.generate_content(
            model=s.gemini_model,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "temperature": 0.7,
            },
        )
    except Exception as e:  # noqa: BLE001
        logger.exception("Gemini call failed")
        raise GeminiError(f"Gemini call failed: {e}") from e

    text = (getattr(response, "text", None) or "").strip()
    if not text:
        raise GeminiError("Empty response from Gemini.")
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise GeminiError(f"Gemini did not return valid JSON: {text[:200]}") from e


def generate_exercises(
    *,
    lesson_title: str,
    lesson_theory: str,
    n: int = 3,
    level: str = "lycée — 2ème info",
    ex_type: str = "mixed",
) -> list[dict[str, Any]]:
    """Returns a list of {statement, type, difficulty} dicts."""
    n = max(1, min(int(n), 10))
    prompt = _EXERCISES_PROMPT.format(
        n=n,
        level=level,
        ex_type=ex_type,
        lesson_title=lesson_title,
        lesson_theory=lesson_theory[:8000],
    )
    data = _generate_json(prompt)
    items = data.get("exercises") or []
    if not isinstance(items, list):
        raise GeminiError("Expected 'exercises' to be a list.")
    cleaned: list[dict[str, Any]] = []
    for raw in items[:n]:
        if not isinstance(raw, dict):
            continue
        statement = (raw.get("statement") or "").strip()
        if not statement:
            continue
        cleaned.append(
            {
                "statement": statement,
                "type": (raw.get("type") or "algorithm").lower(),
                "difficulty": (raw.get("difficulty") or "easy").lower(),
            }
        )
    if not cleaned:
        raise GeminiError("Gemini returned no usable exercises.")
    return cleaned


def generate_correction(*, statement: str, ex_type: str = "mixed") -> dict[str, Any]:
    """Returns a {content, pseudocode, python_code} dict."""
    prompt = _CORRECTION_PROMPT.format(statement=statement, ex_type=ex_type)
    data = _generate_json(prompt)
    return {
        "content": (data.get("content") or "").strip(),
        "pseudocode": (data.get("pseudocode") or None) or None,
        "python_code": (data.get("python_code") or None) or None,
    }
