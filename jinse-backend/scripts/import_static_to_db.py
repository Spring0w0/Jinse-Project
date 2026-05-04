r"""Import the backend-owned Jinse JSON data into PostgreSQL.

This script is overwrite-safe: it clears `poems` and `learning_modules`,
recreates the current dataset, and validates the final row counts.

Usage examples (PowerShell):

```powershell
cd D:/jinse/Jinse-Project/jinse-backend
$env:DATABASE_URL = "postgresql://jinse_user:jinse_pass@localhost:5432/jinse_db"
python scripts/import_static_to_db.py
```

If `DATABASE_URL` is not set, the script falls back to a PostgreSQL URL built
from `POSTGRES_*` variables and defaults the database name to `jinse_db`.

The script reads only `D:/jinse/Jinse-Project/jinse-backend/data/*.json`.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import quote_plus

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app import create_app
from jinse_backend.db import db
from jinse_backend.models import LearningModule, Poem


MODULES = {
    "basic": (
        ("appreciation", "appreciation"),
        ("quiz", "quiz"),
        ("similarPoems", "similar-poems"),
    ),
    "advanced": (
        ("aiImage", "ai-image"),
        ("toneAnalysis", "tone-analysis"),
        ("knowledgeGraph", "knowledge-graph"),
    ),
}


def build_database_url(args: argparse.Namespace) -> str:
    if args.database_url:
        return args.database_url

    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url

    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "")
    database = os.getenv("POSTGRES_DB", "jinse_db")

    encoded_user = quote_plus(user)
    encoded_password = quote_plus(password)
    auth = f"{encoded_user}:{encoded_password}@" if password else f"{encoded_user}@"
    return f"postgresql://{auth}{host}:{port}/{database}"


def load_dataset(file_name: str):
    source_path = DATA_DIR / file_name
    if not source_path.exists():
        raise FileNotFoundError(f"backend data file not found: {source_path}")
    return json.loads(source_path.read_text(encoding="utf-8"))


def import_data(reset: bool = True):
    catalog = load_dataset("poemCatalog.json")
    basic_data = load_dataset("poemLearningData.json")
    advanced_data = load_dataset("poemAdvancedLearningData.json")

    app = create_app()
    with app.app_context():
        db.create_all()

        if reset:
            db.session.query(LearningModule).delete(synchronize_session=False)
            db.session.query(Poem).delete(synchronize_session=False)
            db.session.commit()

        poem_count = 0
        module_count = 0

        for item in catalog:
            external_id = item["id"]
            poem = Poem()
            poem.external_id = external_id
            poem.title = item.get("title") or external_id
            poem.author = item.get("author")
            poem.dynasty = item.get("dynasty")
            poem.stage_key = item.get("stageKey")
            poem.stage_label = item.get("stageLabel")
            poem.year_range = item.get("yearRange")
            poem.summary = item.get("summary")
            poem.full_text = item.get("fullText")
            poem.hero_lines = item.get("heroLines") or []
            db.session.add(poem)
            db.session.flush()
            poem_count += 1

            for source_name, modules in MODULES.items():
                source = basic_data if source_name == "basic" else advanced_data
                poem_payload = source.get(external_id) or source.get("jinse")
                if not poem_payload:
                    continue

                for source_key, module_name in modules:
                    module_payload = poem_payload.get(source_key)
                    if module_payload is None:
                        continue

                    module = LearningModule()
                    module.poem_id = poem.id
                    module.name = module_name
                    module.data = module_payload
                    db.session.add(module)
                    module_count += 1

        db.session.commit()

        poems_in_db = db.session.query(Poem).count()
        modules_in_db = db.session.query(LearningModule).count()

        print(f"Import completed: {poem_count} poems prepared, {module_count} modules prepared.")
        print(f"Database counts: poems={poems_in_db}, learning_modules={modules_in_db}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import Jinse backend JSON data into PostgreSQL.")
    parser.add_argument(
        "--database-url",
        help="Explicit SQLAlchemy DATABASE_URL. If omitted, uses DATABASE_URL or POSTGRES_* environment variables.",
    )
    parser.add_argument(
        "--no-reset",
        action="store_true",
        help="Do not truncate existing rows before importing.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None):
    args = parse_args(argv)
    database_url = build_database_url(args)
    os.environ["DATABASE_URL"] = database_url

    print(f"Using database: {database_url.split('@')[0] if '@' in database_url else database_url}")
    import_data(reset=not args.no_reset)


if __name__ == "__main__":
    main()

