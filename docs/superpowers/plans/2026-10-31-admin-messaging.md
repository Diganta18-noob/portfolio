# Portfolio admin and messaging repair plan

**Goal:** Make Diganta's public portfolio, admin portal, and contact messaging use one consistent Supabase backend when configured, with honest static fallback.
**Architecture:** Keep React/Vite and existing dashboard components. Centralize backend detection, validated contact submission, public project reads, and storage handling. Enforce admin permissions and inbox privacy in SQL, not browser state.
**Scope:** Preserve existing personal content and design. No deployment or external messages. Use only the user's Supabase project; no invented credentials or bypass login.

- [x] Add failing node:test cases for backend configuration, admin role checks, private message validation/delivery errors, public published filtering, and uploads.
- [x] Implement shared services; repair login/session handling and admin CRUD error paths; connect public project details to live reads.
- [x] Implement private contact inbox and public comments with explicit static fallback; add fresh-project SQL/RLS/storage and setup documentation.
- [x] Run regression tests/build and browser checks for public pages, login configuration state, protected routes, validation, and unknown projects. Record any authenticated checks blocked by absent Supabase setup.

**Review focus:** Network failures must preserve form input; signed-out/non-admin users must never view inbox; draft projects must not leak via cache; mutations must not claim success without server confirmation; no credentials printed or committed.

Live backend verification remains pending user configuration; see ADMIN-MESSAGING-REVIEW.md.
