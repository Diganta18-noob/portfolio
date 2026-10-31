# Contact notification and guestbook cleanup repair

- Verify public guestbook data and confirm mail delivery architecture.
- Keep Supabase inbox storage authoritative; add FormSubmit email notification only after a successful database write.
- Treat provider HTTP 200 with success=false as failure/activation pending, never email delivery success. Preserve database success if notification fails.
- Exclude only the confirmed imported template row from public guestbook and supply an exact-id cleanup SQL script for the owner to execute.
- Clear stale form success messages on edits/invalid resubmission; keep visitor input on failed database submissions.
- Verify regression tests, build, source diff, and email provider acceptance after activation; push to the existing master branch.

Required external step: recipient must activate FormSubmit email. Database deletion requires admin/SQL access; public keys cannot delete comments.
