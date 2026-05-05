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
COPY jinse-backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY jinse-backend/ /app/jinse-backend/
COPY jinse-frontend/src/mocks/ /app/jinse-frontend/src/mocks/

COPY jinse-backend/scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 5001
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM caddy:2-alpine AS caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend-build /app/jinse-frontend/dist /srv
