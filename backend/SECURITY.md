# Security Checklist

## Before production

1. Copy [.env.production.example](/Users/bubble3/Desktop/Барбер Hunter/hunter-club/backend/.env.production.example) to `.env.production`.
2. Replace `NEXTAUTH_SECRET` with a random secret at least 32 characters long.
3. Replace `POSTGRES_PASSWORD` with a strong unique database password.
4. Change the temporary admin password immediately after first login.
5. Make sure the database is not exposed publicly. Use [docker-compose.prod.yml](/Users/bubble3/Desktop/Барбер Hunter/hunter-club/backend/docker-compose.prod.yml) or a private managed PostgreSQL instance.
6. Put the app behind Nginx with HTTPS enabled. Use [nginx.conf](/Users/bubble3/Desktop/Барбер Hunter/hunter-club/backend/nginx/nginx.conf) as the base.
7. Restrict SSH access on the server:
   - disable password login
   - use SSH keys only
   - allow only your IP where possible
8. Enable automatic backups for PostgreSQL.
9. Update dependencies regularly and rebuild the containers.

## Already enforced in code

- Admin session cookie is `HttpOnly`, `Secure` in production, and `SameSite=Strict`.
- `NEXTAUTH_SECRET` is required and the default placeholder is rejected.
- Plain-text admin passwords are rejected in production.
- Admin login is rate-limited.
- Security headers and CSP are applied by middleware.

## Recommended first server commands

```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up -d --build
```
