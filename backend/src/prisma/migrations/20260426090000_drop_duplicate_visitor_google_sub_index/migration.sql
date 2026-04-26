-- Remove a legacy duplicate non-unique index if it exists.
-- The unique index created by Prisma (`visitor_accounts_google_sub_key`) stays in place.
DROP INDEX IF EXISTS "visitor_accounts_google_sub_idx";
