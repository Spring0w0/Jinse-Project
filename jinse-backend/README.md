# Jinse Backend

Flask backend for the global poetry learning chat widget.

## Setup

```bash
cd jinse-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

Create your local config first:

```bash
cp .envexample .env
```

Edit `.env`:

```bash
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=
OPENAI_TIMEOUT=20
OPENAI_MAX_TOKENS=320
OPENAI_TEMPERATURE=0.25
OPENAI_MAX_RETRIES=0
```

Then run:

```bash
python app.py
```

The server listens on `http://127.0.0.1:5001` by default.

Useful environment variables:

- `OPENAI_API_KEY`: enables real LLM streaming through LangChain.
- `OPENAI_MODEL`: optional model name, defaults to `gpt-4.1-mini`.
- `OPENAI_BASE_URL`: optional OpenAI-compatible endpoint.
- `OPENAI_TIMEOUT`: model request timeout in seconds, defaults to `20`.
- `OPENAI_MAX_TOKENS`: caps reply length, defaults to `320`.
- `OPENAI_TEMPERATURE`: model temperature, defaults to `0.25`.
- `OPENAI_MAX_RETRIES`: model request retries, defaults to `0`.
- `JINSE_BACKEND_HOST`: default `127.0.0.1`.
- `JINSE_BACKEND_PORT`: default `5001`.
- `JINSE_CORS_ORIGIN`: default `*`.
- `JINSE_FALLBACK_STREAM_DELAY`: fallback streaming delay in seconds, default `0.08`.

If `OPENAI_API_KEY` is not set, `/api/chat` still streams a deterministic local reply so the frontend can be tested end to end.

## Import current project data into PostgreSQL

If you already created a PostgreSQL database named `jinse_db`, you can import the current backend-owned JSON data into it with:

```powershell
cd D:\jinse\Jinse-Project\jinse-backend
$env:DATABASE_URL = "postgresql://jinse_user:jinse_pass@localhost:5432/jinse_db"
python scripts\import_static_to_db.py
```

If you prefer not to set `DATABASE_URL`, the script also accepts `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, and `POSTGRES_DB`.

The script reads from `jinse-backend/data/poemCatalog.json`, `poemLearningData.json`, and `poemAdvancedLearningData.json`.

By default, the script truncates the `poems` and `learning_modules` tables before re-importing, so you can run it again safely.

## API

- `GET /api/health`
- `GET /api/poems`
- `GET /api/poems/timeline`
- `GET /api/poems/<poem_id>`
- `GET /api/poems/<poem_id>/appreciation`
- `GET /api/poems/<poem_id>/tone-analysis`
- `GET /api/poems/<poem_id>/ai-image`
- `GET /api/poems/<poem_id>/knowledge-graph`
- `GET /api/poems/<poem_id>/quiz`
- `GET /api/poems/<poem_id>/similar-poems`
- `POST /api/chat`
