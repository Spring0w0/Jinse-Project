#!/bin/bash
# backup-db.sh — Create a compressed PostgreSQL backup with timestamp
# Usage: ./scripts/backup-db.sh [backup_dir]
# Default backup_dir is ./backups/

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/jinse_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Source .env for POSTGRES_* variables
set -a; source .env; set +a

echo "[backup] Creating backup: ${BACKUP_FILE}"
docker compose exec -T db \
  pg_dump -U "${POSTGRES_USER:-jinse}" -d "${POSTGRES_DB:-jinse}" \
  | gzip > "${BACKUP_FILE}"

echo "[backup] Done. Size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Rotate: keep last 7 daily backups
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/jinse_backup_*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 7 ]; then
    ls -1t "${BACKUP_DIR}"/jinse_backup_*.sql.gz | tail -n +8 | xargs rm -f
    echo "[backup] Rotated old backups (keeping last 7)."
fi
