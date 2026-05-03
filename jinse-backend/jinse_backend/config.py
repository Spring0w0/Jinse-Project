from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]


def load_backend_env():
    load_dotenv(BACKEND_DIR / ".env")
