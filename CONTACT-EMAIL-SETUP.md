# Contact and guestbook behavior

Contact enquiries are saved to the Supabase private inbox first. After confirmation, the site forwards the name, reply email, and message to FormSubmit for email notification. The configured recipient is personalInfo.email in src/portfolioConfig.js. FormSubmit requires one activation email; no private API key is needed.

A rejected email-provider response (including HTTP 200 with success=false) is not treated as email success. If notification fails or times out, the enquiry remains in the admin inbox and the visitor sees that it was saved.

The public guestbook is separate and does not send email. The imported demo comment is excluded by its exact known ID; visitor comments remain visible. For permanent database cleanup, run supabase/remove-imported-demo-comment.sql in your own Supabase SQL Editor, or delete the imported row from Admin > Comments. The cleanup checks both ID and content fingerprint and preserves other records.

FormSubmit documentation: https://formsubmit.co/documentation
