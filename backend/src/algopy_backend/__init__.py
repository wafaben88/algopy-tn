"""AlgoPy TN backend.

Flask + SQLAlchemy app factory. Exposes:

- REST API for chapters/sections/lessons/exercises/corrections
- JWT-based auth with admin/student roles
- Secure image serving (canvas + watermark on the client)
- Gemini-powered exercise/correction generation
"""

from .app import create_app

__all__ = ["create_app"]
