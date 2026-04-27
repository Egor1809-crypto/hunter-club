#!/bin/bash
set -euo pipefail

# Hunter production deploy.
# Run on the server from the repository root: bash deploy.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

DOMAIN="${DOMAIN:-slava-hunter.ru}"
BACKEND_URL="${BACKEND_URL:-https://${DOMAIN}}"
FRONTEND_DIST_DIR="${FRONTEND_DIST_DIR:-/var/www/slava-hunter}"

echo "=== 1. Updating repository ==="
git pull origin main

echo "=== 2. Validating backend production env ==="
if [ ! -f backend/.env.production ]; then
  echo "ERROR: backend/.env.production not found."
  echo "Create it from backend/.env.production.example and fill real secrets first."
  exit 1
fi

cd backend
npm install
npm run env:check -- .env.production

echo "=== 3. Building frontend ==="
cd ../frontend
npm install
npm run build

echo "=== 4. Publishing frontend assets ==="
sudo mkdir -p "$FRONTEND_DIST_DIR"
sudo rm -rf "${FRONTEND_DIST_DIR:?}/"*
sudo cp -R dist/. "$FRONTEND_DIST_DIR/"

echo "=== 5. Building and starting backend containers ==="
cd ../backend
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

echo "=== 6. Waiting for backend ==="
sleep 10

echo "=== 7. Checking backend container and migrations ==="
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T app npm run prisma:migrate:status

echo "=== 8. Smoke checks ==="
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T app npm run smoke:api
curl -fsSI "${BACKEND_URL}/api/public/services" >/dev/null

echo ""
echo "Deploy completed."
echo "Site:   https://${DOMAIN}"
echo "CRM:    https://${DOMAIN}/admin"
echo "Google callback required in Google Cloud:"
echo "        https://${DOMAIN}/api/public/account/google/callback"
