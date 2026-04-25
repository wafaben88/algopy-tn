"""Password hashing — Argon2 via argon2-cffi."""

from __future__ import annotations

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

_hasher = PasswordHasher()


def hash_password(plain: str) -> str:
    return _hasher.hash(plain)


def verify_password(stored_hash: str, plain: str) -> bool:
    try:
        return _hasher.verify(stored_hash, plain)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


def needs_rehash(stored_hash: str) -> bool:
    return _hasher.check_needs_rehash(stored_hash)
