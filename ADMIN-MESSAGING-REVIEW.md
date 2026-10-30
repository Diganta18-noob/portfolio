# Admin and messaging review — 31 October 2026

## Project scope
Repository: https://github.com/Diganta18-noob/portfolio. This review covers project/certificate management, public comment moderation, admin authentication, and the private contact inbox.

## Changes
- Replaced dummy Supabase success responses with explicit configuration detection; rejected secret/service-role keys.
- Added fail-closed admin checks, auth-state rechecks, visible loading/errors, and setup state. No login bypass or default account.
- Added checked database mutations and validated admin uploads. Failed writes keep editors open; failed uploads do not manufacture successful URLs.
- Added publish/unpublish and consistent published-only reads, including direct detail URLs. Removed stale-cache dependence from detail pages.
- Added private contact RPC and admin inbox with read/unread, pagination, reply draft, and deletion. Contact success requires an acknowledged database write; email delivery is not configured.
- Restored a distinct, database-backed text guestbook. Removed anonymous photo uploads to avoid storage abuse.
- Fixed comment pagination after deletion and broken-image certificate deletion controls.
- Removed inherited author metadata from project detail pages and fixed missing/unknown project results.
- Added Supabase schema, RLS policies, buckets, seed data, environment template, and admin setup guide.

## Verification
- 12 node:test regression cases passed, including rejected privileges, invalid contact input, database/network failure propagation, published filtering, upload errors, and pagination after deletion.
- Production Vite build passed.
- Browser checked: public identity/projects; certificates and skills tabs; contact invalid-email validation; login setup state with disabled sign-in; protected inbox redirects to login; direct DogCart details; unknown project has a back link.
- Independent reviewer found anonymous upload exposure and comment pagination regression; both addressed and focused recheck passed.
- No real contact message, email, or public comment was sent during these checks.

## Pending live verification
The environment file has been prepared for the user to fill. SQL has not been executed against a Supabase project. Real authentication, role/RLS enforcement, CRUD, storage, realtime, and private message receipt still require the user's backend settings, executed setup.sql, and an admin account. Follow BACKEND-SETUP.md; the SQL replaces policies on this application's tables/buckets and keeps their records.
