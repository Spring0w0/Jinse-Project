# Deployment

This project deploys with Docker Compose:

- `caddy`: serves the built Vue frontend and reverse proxies `/api/*`.
- `backend`: runs the Flask API with Gunicorn.
- `db`: PostgreSQL for backend database configuration.

## 1. Server Prerequisites

Install Docker and Docker Compose on the server.

Point your domain DNS `A` record to the server IP.

## 2. Configure Environment

Copy the deployment template:

```bash
cp .env.deploy.example .env
```

Edit `.env`:

```env
SITE_DOMAIN=your-domain.com

OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=

POSTGRES_PASSWORD=replace-with-a-strong-password
```

For an OpenAI-compatible provider, set `OPENAI_BASE_URL` and the provider model name.

## 3. Start

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f caddy
docker compose logs -f backend
```

## 4. Test

Open:

```text
https://your-domain.com
```

Smoke-test API through Caddy:

```bash
curl https://your-domain.com/api/health
curl https://your-domain.com/api/poems/jinse/appreciation
```

## 5. Update

```bash
git pull --ff-only origin main
docker compose up -d --build
```

## Notes

- Do not commit `.env`; it contains real secrets.
- Caddy automatically provisions HTTPS certificates for public domains.
- Keep ports `80` and `443` open on the server firewall.
