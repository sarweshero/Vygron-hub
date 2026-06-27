"""Test settings — uses SQLite so tests run without PostgreSQL."""
from .settings import *  # noqa: F401,F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

SECRET_KEY = "test-secret-key-not-for-production"
DEBUG = False
ALLOWED_HOSTS = ["testserver"]

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

DEFAULT_FILE_STORAGE = "django.core.files.storage.InMemoryStorage"
