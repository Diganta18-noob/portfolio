# Scheduled report setup

The protected Vercel function is `/api/daily-report`. It is disabled by default. No real email was sent during implementation tests.

1. Verify your sending domain in Resend DNS settings.
2. Add these **server-only Production variables** in Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `REPORT_FROM`, `REPORT_TO`, `CRON_SECRET`, and `REPORTS_ENABLED=true`. Never use a VITE_ prefix for them or paste secrets into chat.
3. Use a verified sender such as `Diganta Reports <reports@diganta.tech>` and your own destination email. Generate a long random CRON_SECRET privately.
4. Add `"crons": [{"path":"/api/daily-report","schedule":"30 3 * * *"}]` to vercel.json when ready. This requests approximately 09:00 Asia/Kolkata daily. Actual invocation precision depends on Vercel plan.
5. Redeploy, inspect Vercel function/cron logs and Resend email logs. Provider acceptance is not proof of inbox delivery. Verify the received report yourself.

Cron is intentionally not registered until environment variables are configured. API routes are excluded from the SPA rewrite. Missing authentication returns 401; disabled reports skip; missing configuration/data/provider failure does not claim success. Counts refer to the previous completed Kolkata day, while unread enquiries are a current all-time snapshot. Email contains aggregate counts only, no message bodies or sender details. Provider idempotency uses one key per reporting date; it is not an unlimited-duration deduplication guarantee. Keep retries within the provider's supported idempotency window.

To stop emails: set REPORTS_ENABLED=false and redeploy. The authenticated endpoint also returns a disabled result.
