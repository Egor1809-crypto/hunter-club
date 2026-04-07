#!/bin/bash
set -euo pipefail

# ============================================
# Hunter Club — скрипт деплоя
# Запускать на сервере: bash deploy.sh
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== 1. Обновляю код ==="
git pull origin main

echo "=== 2. Собираю frontend ==="
cd frontend
npm install --production=false
npm run build
echo "Frontend собран в frontend/dist/"

# Копируем сборку туда, где nginx её найдёт
sudo mkdir -p /var/www/frontend
sudo rm -rf /var/www/frontend/*
sudo cp -r dist/* /var/www/frontend/
echo "Frontend скопирован в /var/www/frontend/"
cd ..

echo "=== 3. Проверяю backend/.env ==="
if [ ! -f backend/.env ]; then
    echo ""
    echo "ОШИБКА: файл backend/.env не найден!"
    echo ""
    echo "Выполни:"
    echo "  cp backend/.env.example backend/.env"
    echo "  nano backend/.env"
    echo ""
    echo "Заполни все поля (пароли, секреты) и запусти deploy.sh снова."
    exit 1
fi

echo "=== 4. Запускаю Docker ==="
cd backend
docker compose down
docker compose up -d --build

echo "=== 5. Жду запуска (30 сек) ==="
sleep 30

echo "=== 6. Проверяю ==="
if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "Backend API работает!"
else
    echo "Backend не отвечает. Смотри логи:"
    echo "  cd backend && docker compose logs app"
fi

echo ""
echo "========================================"
echo "  ДЕПЛОЙ ЗАВЕРШЁН"
echo "========================================"
echo ""
echo "  Сайт:    https://slava-hunter.ru"
echo "  Админка: https://slava-hunter.ru/admin"
echo ""
echo "  Если SSL ещё не настроен:"
echo "  sudo certbot certonly --webroot -w /var/www/certbot -d slava-hunter.ru"
echo "  cd backend && docker compose restart nginx"
echo ""
echo "  Создать админа:"
echo "  cd backend"
echo "  docker compose exec app node -e \"require('bcryptjs').hash('ПАРОЛЬ',12).then(h=>console.log(h))\""
echo "  docker compose exec db psql -U \$POSTGRES_USER -d \$POSTGRES_DB -c \\"
echo "    \"INSERT INTO admin_users (username, password_hash, display_name, role)"
echo "     VALUES ('admin', 'ХЕШ', 'Слава', 'owner');\""
echo "========================================"
