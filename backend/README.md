<<<<<<< HEAD
# Hunter Backend

Отдельный backend-проект для CRM и API барбершопа Hunter.

## Что уже есть

- Next.js 14 App Router
- Prisma schema
- PostgreSQL через Docker Compose
- Первые API routes:
  - `GET /api/services`
  - `PATCH /api/services`
  - `GET /api/clients`
  - `POST /api/clients`
  - `GET /api/clients/:id`
  - `PATCH /api/clients/:id`
  - `GET /api/bookings`
  - `POST /api/bookings`
  - `GET /api/bookings/:id`
  - `PATCH /api/bookings/:id`

## Быстрый старт

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:generate
npm run dev
```

## Следующие шаги

1. Проверить соответствие Prisma schema и `database/init.sql`
2. Реализовать `schedule`
3. Реализовать `loyalty`
4. Добавить auth для admin
5. Добавить analytics и SMS
=======
# Welcome to your Lovable project

TODO: Document your project here
>>>>>>> 5bcbf57b409ddcd83dfa716828e96fec8c501e41
