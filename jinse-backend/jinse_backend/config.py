from pathlib import Path
import os

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]


def load_backend_env():
    load_dotenv(BACKEND_DIR / ".env")


def get_database_url():
    """Return the DATABASE_URL from environment or a sensible sqlite fallback.

    Uses BACKEND_DIR/jinse_dev.db as fallback for local development.
    """
    return os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BACKEND_DIR / 'jinse_dev.db'}",
    )

