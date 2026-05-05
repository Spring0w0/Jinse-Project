#!/bin/bash
set -e

# ============================================================
# Jinse Backend Entrypoint
# 1. Wait for PostgreSQL to be ready
# 2. Apply Alembic migrations
# 3. Import static data if database is empty (idempotent)
# 4. Start Gunicorn
# ============================================================

echo "[entrypoint] Waiting for PostgreSQL..."

MAX_RETRIES=30
RETRY_COUNT=0
until python -c "
import os, sys
from sqlalchemy import create_engine, text
engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
" 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "[entrypoint] ERROR: PostgreSQL not available after ${MAX_RETRIES} attempts."
        exit 1
    fi
    echo "[entrypoint] PostgreSQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES)..."
    sleep 2
done
echo "[entrypoint] PostgreSQL is ready."

# Step 2: Apply migrations
echo "[entrypoint] Applying database migrations..."
cd /app/jinse-backend
python -m flask --app app:app db upgrade
echo "[entrypoint] Migrations applied."

# Step 3: Import static data if poems table is empty
echo "[entrypoint] Checking if data import is needed..."
IMPORT_NEEDED=$(python -c "
import os
from sqlalchemy import create_engine, text
engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    count = conn.execute(text('SELECT COUNT(*) FROM poems')).scalar()
    print('yes' if count == 0 else 'no')
")

if [ "$IMPORT_NEEDED" = "yes" ]; then
    echo "[entrypoint] Database is empty. Running data import..."
    python /app/jinse-backend/scripts/import_static_to_db.py
    echo "[entrypoint] Data import completed."
else
    echo "[entrypoint] Database already contains data. Skipping import."
fi

# Step 4: Start Gunicorn
echo "[entrypoint] Starting Gunicorn..."
exec gunicorn "app:app" \
    --chdir /app/jinse-backend \
    --bind "0.0.0.0:${JINSE_BACKEND_PORT:-5001}" \
    --workers "${GUNICORN_WORKERS:-2}" \
    --threads "${GUNICORN_THREADS:-4}" \
    --timeout "${GUNICORN_TIMEOUT:-120}"
