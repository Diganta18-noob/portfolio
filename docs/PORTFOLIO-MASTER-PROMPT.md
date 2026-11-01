# Implementation master prompt

Copy the prompt below into the coding agent working in this repository. The companion master plan is the source of product scope; verify it against the current source before implementation.

---

Act as a senior product designer, React engineer and analytics engineer. Upgrade Diganta Biswas's existing portfolio and private admin into a polished public portfolio and a dependable analytics workspace.

Work inside the existing repository. Read `docs/PORTFOLIO-MASTER-PLAN.md`, repository instructions, routes, portfolio configuration, services, database migrations and tests first. Report any mismatch between the plan and current source. Retain React/Vite/Tailwind/Supabase. This task improves an existing deployed product; do not scaffold a replacement.

## Product intent

Public: establish Diganta's credibility through clear professional positioning, selected projects and convincing case studies. Admin: manage content and enquiries, then understand real audience behavior and project performance. “Data analyst perspective” describes the private workspace's analytical functionality; do not change Diganta's job title or invent qualifications.

Keep the orbit logo, portrait in About, real biography/experience/social links, actual projects, résumé at `/resume/Diganta-Biswas-Resume.pdf`, working contact/guestbook flows and existing database records. Keep private contacts private and admin access owner-authorized.

## Design direction

Build an editorial dark public site: #0B0D12 canvas, #12161F surfaces, #F4F6FA text, #A4ADBC secondary text, restrained #818CF8 accent. Establish strong type scale, 1180px content width, generous section spacing, authentic project imagery and purposeful asymmetry. Replace repetitive glow/glass/gradient cards with a coherent composition. Keep headings immediately readable and remove a mandatory welcome interstitial. Use solid text for most content, not gradient text everywhere.

Build a separate professional admin shell: light #F6F7F9 canvas, white panels, #17212F primary text, #526173 secondary text, #DCE2E9 borders, #4338CA actions; optional persisted dark theme. Use a 240px sidebar, breadcrumb/header, page-specific actions, data tables, compact KPI tiles and filterable chart panels. Cover Overview, Analytics, Projects, Content, Inbox, Guestbook, Reports and Settings as implemented stages. No dead menu items. Ensure the public decorative background does not render behind the admin workspace.

Create reusable tokens and components for headers, buttons, inputs, tables, filters, badges, drawers, dialogs, chart panels and all loading/empty/error states. Use consistent spacing, restrained 8–12px radii, crisp borders and Lucide icons. Avoid a dashboard composed entirely of oversized cards. All icon controls need accessible names.

## Motion

Use existing Framer Motion and CSS. Audit and consolidate overlapping animation tools instead of adding another. Public sections may reveal once with opacity and 12–20px translation over 350–450ms; controls transition in 120–180ms; drawers/tabs in 160–220ms. Keep chart updates restrained. Honor reduced motion globally, and keep content visible without animation. No scroll hijacking, cursor trails, persistent particle effects or artificial loading delays.

## Functional scope, in order

1. Record current behavior, test/build status and screenshots. Produce homepage, admin overview and inbox mockups with mobile states; label any illustrative data. Present the design for review before the broad rewrite.
2. Implement the design system, isolated admin shell, improved login, overview from real existing table data, and consistent CRUD tables/forms. Retain all current operations. Existing counts must distinguish current inventory from date-filtered activity.
3. Improve public hierarchy, hero, selected work, case studies, experience and contact sections. Use valid link/button semantics. Preserve résumé, deep links, direct email and real submit behavior.
4. Implement a versioned analytics contract and validated ingestion endpoint before building traffic charts. Track page_view, project_view, project_demo_click, project_source_click, resume_click, contact_start, contact_submit_success and allowlisted social_click. Count contact success only after database acknowledgement. Resume clicks are not verified completed downloads.
5. Build real Analytics: date range, previous-period comparison, trend chart, acquisition/referral/campaign breakdown, project ranking and ordered session funnel. Include an accessible data table and a metric glossary. Never fabricate historical traffic or present fixtures as live statistics.
6. Upgrade Inbox to searchable list/detail layout with unread/date/status/tag filters, manual status changes, notes, archive and follow-up history. A mailto click is not a sent reply. Any in-app sending must be separately configured server-side with a verified mail provider and accurate delivery states.
7. Add filtered CSV reports and saved views. CSV exports represent the full authorized filtered dataset, include timezone/definitions, and escape spreadsheet formula injection. Advanced CMS revisions, scheduled emails and delivery webhooks are later modules after their dependencies exist.

## Analytics correctness

Follow the detailed contract in the master plan. Deduplicate retries by event_id. Use validated enum fields, length limits and server timestamps. Do not ingest private message content, names, emails, raw query strings or arbitrary URLs. Exclude admin/login activity. Public forms must work with telemetry unavailable.

Use the plan's proposed explicit opt-in collection default: no collection or event replay before consent, sessionStorage identifiers reset after 30 minutes of inactivity, no persistent visitor identifier, and stop/clear on withdrawal. Report opted-in observed sessions, not all visitors or returning visitors. Explain separate-tab and coverage limitations. Keep the consent UI accessible and non-blocking. Show “Not collected” before tracking began. Separate total enquiries from unique converting sessions. Attribute a contact to the last observed project in the same session only when evidence exists. Unknown stays unknown. Use Asia/Kolkata display timezone and UTC storage. Handle zero previous-period denominators without Infinity. Compute funnels from ordered events in the same session, not unrelated event totals. Show sample sizes and collection health; do not invent causal insights.

## Security and migration requirements

Use additive migrations, preserving existing IDs and records. Protect analytics, contacts, reports, settings and audit history with database authorization. Test anonymous, authenticated non-admin and admin access. Do not weaken role checks to fix login. No browser self-promotion to admin. Public telemetry endpoints validate/rate-limit payloads and cannot expose raw data. Analytics views must not bypass RLS accidentally. Any security-definer function needs narrow grants, fixed search_path and explicit authorization appropriate to its purpose.

Keep service-role/mail secrets server-side and out of source, logs and browser bundles. No destructive resets, fake backend clients or success before persistence. Do not write sensitive content to audit logs. Use server-written audit actors, not visitor-supplied identities.

## Engineering expectations

Keep route/page components small, reusable UI separate from querying, and metric logic testable. Introduce a chart library only after confirming the existing stack lacks suitable functionality; explain and lazy-load the choice. Avoid dependency churn or a framework migration. Remove unused libraries only after verifying references and regression checks.

Use server-side filtering/pagination for larger tables and a narrow aggregation layer for metrics. Synchronize shareable analytical filters with URL parameters without exposing private message text. Resolve request races and stale data states. Give charts appropriate units, labels, useful tooltips and visible legends where necessary.

## Verification and delivery

Work stage by stage with reviewable changes. Preserve and run existing tests/build. Add tests for real risks: migrations preserving data, access control, metric/date boundaries, duplicate events, funnel ordering, attribution, zero denominators and notification failure. Test actual UI behavior at 1440px, 768px and 390px, keyboard access and reduced motion. Cover empty, error, loading and populated states. Check session expiry, sign-out, direct route refresh, contact persistence, guestbook and résumé download.

Use performance budgets and keep charts/admin dependencies out of the public loading path. Do not claim field performance, Gmail delivery or a deployed fix without evidence. Report exactly what was built, tested, deployed and still requires external configuration.

Start with the baseline audit and three screen mockups. Make routine design and engineering choices autonomously using the master plan. Ask only about decisions that materially change scope, identity, data access or paid service requirements. Keep the product functional between stages. Commit/publish only according to the user's standing authorization and applicable repository rules.

---

Expected final result: a portfolio with distinctive professional composition, a coherent admin application, functional management workflows, and analytics whose numbers can be traced to actual events and clearly defined calculations.
