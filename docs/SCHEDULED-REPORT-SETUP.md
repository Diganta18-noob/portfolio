# Scheduled report setup

The protected Vercel function is `/api/daily-report`. It is disabled by default. No real email was sent during implementation tests.

1. Verify your sending domain in Resend DNS settings.
2. Add these **server-only Production variables** in Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `REPORT_FROM`, `REPORT_TO`, `CRON_SECRET`, and `REPORTS_ENABLED=true`. Never use a VITE_ prefix for them or paste secrets into chat.
3. Use a verified sender such as `Diganta Reports <reports@diganta.tech>` and your own destination email. Generate a long random CRON_SECRET privately.
4. The repository registers `"crons": [{"path":"/api/daily-report","schedule":"30 3 * * *"}]` in vercel.json. This requests approximately 09:00 Asia/Kolkata daily. Actual invocation precision depends on Vercel plan.
5. Redeploy, inspect Vercel function/cron logs and Resend email logs. Provider acceptance is not proof of inbox delivery. Verify the received report yourself.

The daily cron is registered in vercel.json for 03:30 UTC (09:00 Asia/Kolkata). Sending still requires all Production variables and REPORTS_ENABLED=true. API routes are excluded from the SPA rewrite. Missing authentication returns 401; disabled reports skip; missing configuration/data/provider failure does not claim success. Counts refer to the previous completed Kolkata day, while unread enquiries are a current all-time snapshot. Email contains aggregate counts only, no message bodies or sender details. Provider idempotency uses one key per reporting date; it is not an unlimited-duration deduplication guarantee. Keep retries within the provider's supported idempotency window.

To stop emails: set REPORTS_ENABLED=false and redeploy. The authenticated endpoint also returns a disabled result.

## Reading report logs

Runtime Logs now emit a structured outcome for every authenticated run:
- `disabled`: REPORTS_ENABLED is not exactly true.
- `provider_accepted`: Resend acknowledged the request; check Resend/inbox for delivery.
- `failed` with `configuration_incomplete`, `database_request_failed`, `database_count_missing`, `provider_rejected`, `provider_acknowledgement_missing`, or `unexpected_failure`.
- `unauthorized`: the cron bearer secret did not match.

Only allowlisted codes/outcomes and the report day are logged. Raw exceptions, tokens, recipients and message contents are not logged. HTTP 200 alone still does not imply delivery.
