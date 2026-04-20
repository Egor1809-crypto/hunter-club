# Hunter Backend

Backend-проект для CRM и API барбершопа Hunter.

## Стек

- Next.js 14 App Router
- Prisma ORM
- PostgreSQL
- Docker Compose для локальной базы

## Быстрый старт

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:generate
npm run prisma:migrate:deploy
npm run dev
```

`database/init.sql` оставлен как legacy/reference bootstrap. Новые локальные и production-окружения должны подниматься через Prisma migrations.

## Миграции

Для production и новых окружений используем Prisma migrations:

```bash
npm run prisma:migrate:deploy
```

Для проверки статуса миграций:

```bash
npm run prisma:migrate:status
```

`prisma db push` оставлен только как вспомогательная dev-команда. Для сервера и чистой установки используйте migrations.

## Production-проверки

Перед деплоем:

```bash
cp .env.production.example .env.production
npm run env:check
npm run verify
```

Docker-образ перед стартом выполняет `prisma migrate deploy`, поэтому новая база поднимается через миграции без ручного запуска SQL.

## Основные API

- `GET /api/services`
- `PATCH /api/services`
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/:id`
- `PATCH /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id`
- `DELETE /api/bookings/:id`
