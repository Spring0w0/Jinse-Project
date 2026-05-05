# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS frontend-build
WORKDIR /app/jinse-frontend
COPY jinse-frontend/package*.json ./
RUN npm ci
COPY jinse-frontend/ ./
RUN npm run build

FROM python:3.12-slim AS backend
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/jinse-backend \
    JINSE_BACKEND_HOST=0.0.0.0 \
    JINSE_BACKEND_PORT=5001

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY jinse-backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY jinse-backend/ /app/jinse-backend/
COPY jinse-frontend/src/mocks/ /app/jinse-frontend/src/mocks/

EXPOSE 5001
CMD gunicorn "app:app" \
    --chdir /app/jinse-backend \
    --bind 0.0.0.0:5001 \
    --workers "${GUNICORN_WORKERS:-2}" \
    --threads "${GUNICORN_THREADS:-4}" \
    --timeout "${GUNICORN_TIMEOUT:-120}"

FROM caddy:2-alpine AS caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend-build /app/jinse-frontend/dist /srv
