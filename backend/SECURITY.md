# Security Checklist

## Before production

1. Copy `.env.production.example` to `.env.production`.
2. Replace `NEXTAUTH_SECRET` with a random secret at least 32 characters long.
3. Replace `POSTGRES_PASSWORD` with a strong unique database password.
4. Set a private `ADMIN_MFA_CODE` before deploy. Do not use the local fallback `2468`.
5. Change the temporary admin password immediately after first login.
6. Make sure the database is not exposed publicly. Use `docker-compose.prod.yml` or a private managed PostgreSQL instance.
7. Put the app behind Nginx with HTTPS enabled. Use `nginx/nginx.conf` as the base.
8. Add the exact Google OAuth callback in Google Cloud: `https://slava-hunter.ru/api/public/account/google/callback`.
9. Restrict SSH access on the server:
   - disable password login
   - use SSH keys only
   - allow only your IP where possible
10. Enable automatic backups for PostgreSQL.
11. Update dependencies regularly and rebuild the containers.
12. Run `npm run env:check -- .env.production` before every production deploy.

## Already enforced in code

- Admin session cookie is `HttpOnly`, `Secure` in production, and `SameSite=Strict`.
- `NEXTAUTH_SECRET` is required and the default placeholder is rejected.
- Plain-text admin passwords are rejected in production.
- Admin login is rate-limited.
- Security headers and CSP are applied by middleware.

## Recommended first server commands

```bash
cp .env.production.example .env.production
nano .env.production
npm run env:check -- .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T app npm run prisma:migrate:status
```
