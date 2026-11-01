# Diganta portfolio and analytics workspace — master plan

Prepared 1 November 2026. Status: proposed design and delivery plan; no application changes made by this document.

## 1. Intended result

Make diganta.tech feel like a considered professional portfolio, with an admin workspace that helps Diganta understand engagement, manage opportunities, and maintain content. The public site should establish credibility quickly. The private workspace should answer practical questions with trustworthy data.

Interpretation: “data analyst perspective” means analytical capabilities inside the portfolio admin, not changing Diganta's professional identity to Data Analyst or inventing analytics experience. Current identity remains MERN/full stack developer. This is an explicit planning assumption.

Recommended direction: an editorial public portfolio plus a restrained analytics workspace. Keep the orbit logo and a small indigo accent, but replace pervasive purple glass panels with clear hierarchy and purpose-built layouts. Other plausible directions are a highly animated creative portfolio or a conventional corporate site; the first competes with the evidence of work, while the second loses personality. The recommended direction gives the work character and the admin clarity.

## 2. What exists, based on source inspection

- React 18, Vite 5, Tailwind 3, React Router, Supabase Auth/database/storage, Lucide icons and Framer Motion already exist.
- Multiple animation/styling tools are installed, including AOS, GSAP, React Spring, MUI and styled-components. Installed does not establish that each is used. Audit imports before removing dependencies.
- `src/Pages/Dashboard.jsx` has four screens: projects, certificates, comments and messages. Its default destination is projects. There is no overview, analytics collection or reporting screen.
- Messages support pagination, unread filtering, read/unread changes, deletion and a reply link that opens an email app. That link does not establish that an email was sent or answered.
- Public pages use repeated gradient/glow treatments; Home uses AOS and nested anchor/button patterns that should be corrected during component cleanup.
- Five core database tables exist: profiles, projects, certificates, portfolio_comments and contact_messages. They do not provide historical visitor traffic.
- Private contact submissions save to Supabase and request FormSubmit notification. Provider acceptance is not proof of Gmail delivery.
- `/admin` redirects into the protected dashboard; `/login` checks the admin profile. Admin authorization must remain enforced by database policies as well as UI routes.
- The résumé is available at `/resume/Diganta-Biswas-Resume.pdf`. Keep it and the existing personal content intact.

The initial findings above came from source review. A subsequent owner-authorized live inspection on 1 November 2026 confirmed successful sign-in and access to the protected admin screens. Credentials are intentionally excluded from these documents.

### Authenticated live baseline

- Projects: one “Example Project Title” placeholder record. Its demo and source placeholders resolve to relative dashboard URLs rather than valid external destinations. Add external URL validation and clear invalid/empty-link states; replace demo content through a deliberate content migration, without silently deleting production records.
- Certificates: one stored certificate, an upload area and delete control. Loading completes; no upload or deletion was attempted during the review.
- Guestbook: one comment and no pinned comments. Search/filter/pin/delete controls exist. The previously imported author-credit comment was absent. No moderation changes were made.
- Private messages: three messages loaded, with read/unread controls and email reply links. Message bodies and sender details are excluded from the planning artifacts. No messages were sent, deleted or marked read during inspection.
- The observed narrow viewport uses the mobile drawer and a large single-column project card. Glow-heavy surfaces and limited management controls confirm the need for the proposed shell/table redesign. This observation does not substitute for a desktop-width visual review.
- Authentication works for the supplied owner account; the redesign should preserve that working access rather than replace the authentication mechanism.

## 3. Visual specification

### Public portfolio

- A calm dark canvas, generous spacing, large readable headings, mostly solid text, and small areas of indigo/cyan emphasis.
- Suggested tokens: background #0B0D12, surface #12161F, border #29313E, text #F4F6FA, muted #A4ADBC, accent #818CF8. Validate contrast in actual components.
- Typography: one variable sans family, ideally self-hosted; use the existing font if it performs well. Avoid adding several font families. Use a clear 16–18px body size and responsive headings.
- Maximum content width around 1180px; section spacing 72–112px desktop, 48–64px mobile. A consistent spacing scale of 4/8/12/16/24/32/48/64.
- Use 8–12px corners on ordinary controls and panels, with larger corners reserved for the occasional featured project. Borders should be subtle but visible. Do not apply glass, blur and a glow to every surface.
- Hero: Diganta's name, clear role, one concise value statement, View work and Download résumé actions, plus a compact experience/location line. Keep the job title readable without waiting for a typing animation.
- Selected work: prioritize project screenshots and case-study substance over stacks of technology badges. Give each project a short problem, contribution and outcome. Only publish measured results that Diganta can substantiate.
- About: experience timeline, concise biography, grouped capabilities and résumé. Keep the supplied portrait here.
- Contact: clear distinction between private enquiry and public guestbook, reliable submission feedback, and a legible direct email link.
- Remove a compulsory welcome/loading interstitial. Public content should be visible immediately; loading treatments must correspond to actual loading.
- Correct visible spelling such as “Portofolio” to “Portfolio” without breaking existing URLs or database field names.

### Admin workspace

Use a separate visual shell: light neutral surfaces by default, optional dark theme stored per user. An opaque application background should prevent the public animated background from leaking into admin/login routes.

- Suggested light tokens: canvas #F6F7F9, panel #FFFFFF, primary text #17212F, secondary text #526173, border #DCE2E9, primary #4338CA. Validate accessibility before shipping.
- Persistent 240px desktop sidebar; compact header with breadcrumb, page title, search where supported, account menu and View website. Mobile sidebar becomes a focus-managed drawer.
- Main navigation: Overview, Analytics, Projects, Content, Inbox, Guestbook, Reports, Settings. Hide or explicitly label unfinished modules; do not add dead navigation.
- Header controls: date range and compare period on analytical screens; page-specific primary action on content screens. Do not put an Export button on pages without an implemented export.
- Use dense but readable tables for management and analysis, not a long column of giant cards. Default row height around 44–48px, with roomier layouts on mobile.
- Shared components: page header, KPI tile, filter bar, accessible data table, chart panel, detail drawer, confirmation dialog, status badge, skeleton, empty state, error state and toast.
- Consistent icon sizes, button heights, input labels and focus rings. Reserve red for destructive/error states; do not communicate status through color alone.
- Real workflows: search, filter, sort, pagination, multi-select, bulk actions, previews, validation and meaningful errors. Keyboard shortcuts only after ordinary keyboard navigation works.

## 4. Motion system

Use the existing Framer Motion version plus CSS first. Do not install a second motion engine. Consolidate overlapping AOS/CSS/JS transitions gradually after checking usage.

| Interaction | Proposed behavior | Constraint |
| --- | --- | --- |
| Public section arrival | Opacity and 12–20px upward movement, 350–450ms | Once per visit to the section; content remains usable if animation fails |
| Project hover | Image scale up to 1.025 and a small arrow shift | Hover-capable devices only; keyboard focus gets equal affordance |
| Buttons and tabs | Color/opacity transition, 120–180ms | No layout jump or flashing glow |
| Public route changes | Short opacity transition, 180–240ms | Never delay navigation or trap scrolling |
| Admin drawer/dialog | Opacity and short transform, 160–220ms | Proper focus entry, Escape close, return focus |
| Chart/filter changes | Subtle update, 200–300ms | No repeated counting from zero; retain readable values |
| Success/error feedback | Small inline transition | Announce meaningful changes with accessible status text |

Honor `prefers-reduced-motion` globally: remove translation, parallax, continuous decorative motion and chart interpolation. Avoid cursor followers, scroll hijacking, autoplay video and looping particles. Keep animation mostly to opacity and transform, and stop decorative work offscreen.

## 5. Features and delivery priority

### Release A — professional foundation and useful admin

1. **Design system and shell:** shared tokens, responsive layout, new login, sidebar/header, table and form primitives, dark/light theme, accessible states.
2. **Overview:** published/draft project counts, unread messages, total enquiries in range, recent enquiries and recent publishing activity. Label each card's time scope; a current unread count is not a historical trend. Do not infer past draft counts from current state.
3. **Inbox:** searchable list plus detail drawer, unread filter, date filter, tags, manual opportunity status, notes and archive. Proposed statuses: New, Reviewing, Follow-up, Closed. Add a Replied status only as an explicit manual action until an outbound provider supplies evidence.
4. **Content operations:** searchable/sortable project table, draft/publish preview, ordering, image management, case-study fields, certificates and guestbook moderation. Batch publish/archive requires confirmation and reports partial failures.
5. **Public redesign:** new hierarchy, stronger project presentation, responsive sections, correct semantic links/buttons and restrained motion.

### Release B — trustworthy analytics

1. **Acquisition:** sessions, observed anonymous visitors, landing pages, referral domains and allowlisted UTM campaign fields.
2. **Engagement:** project views, project demo/source clicks, résumé-link clicks, outbound LinkedIn/GitHub clicks and contact starts.
3. **Conversion:** unique sessions with a successful contact submission divided by eligible observed sessions, plus a defined contact-start-to-submit rate.
4. **Project performance:** views, outbound click rate and attributed enquiries by project; sortable table with comparison periods.
5. **Analysis workbench:** date presets/custom range, dimensions, allowlisted filters, same-length previous-period comparison, daily/weekly grouping, accessible charts and an underlying table.
6. **Reports:** downloadable CSV with applied filters, timezone, metric definitions and generated timestamp. Saved report configurations are useful; do not expose an arbitrary SQL console.
7. **Data quality:** collection start date, last event, ingestion failures, sample size, duplicate handling, excluded admin traffic, retention and metric glossary.

### Release C — deeper management

- CMS for biography, skills and experience with preview, revision history and rollback; replace the current static configuration only after migration tests establish parity.
- Opportunity pipeline and manually recorded follow-up history, with measurable stage transitions.
- Server-side outbound mail with verified sender and delivery webhooks if in-dashboard sending is desired. Requires separate provider configuration. No browser-held mail secret or automatic claim of delivery.
- Saved views, scheduled report emails and audit history after the underlying data and jobs exist. Scheduling is an operational feature requiring a scheduler and monitoring.
- Portfolio publishing checks: missing screenshots, missing descriptions, inaccessible links and absent metadata. External link checks must run on the server against allowed destinations.

Defer unsupported spectacle: predictive lead scoring on a handful of enquiries, maps with invented geography, fake live visitor counters, fabricated revenue, arbitrary AI insights, and charts full of sample data presented as production.

## 6. Analytics contract

### Event specification

| Event | Trigger | Interpretation |
| --- | --- | --- |
| page_view | Initial public page and SPA route change | Deduplicated view, not a visitor |
| project_view | Project detail becomes visible | One qualifying event per navigation |
| project_demo_click / project_source_click | Valid outbound project link selected | Click intent, not external-site engagement |
| resume_click | Résumé anchor selected | Click intent; cannot prove completed download |
| contact_start | First meaningful form edit | Once per form interaction/session |
| contact_submit_success | Database has acknowledged the submission | Not triggered by button click or notification acceptance |
| social_click | Allowlisted social link selected | Store provider label, not arbitrary destination URLs |

Proposed fields: event_id, schema_version, occurred_at, received_at, event_name, path, project_id where relevant, pseudonymous session_id and optional visitor_id, referrer_domain, allowlisted utm fields and coarse device category. Validate types, lengths, enum values and event-specific fields.

Never send name, email, message body, passwords, access tokens, raw query strings or arbitrary metadata to analytics. Do not persist raw IPs or fingerprint visitors. Use event_id uniqueness for retry deduplication; use server received_at as the reporting timestamp to limit client clock distortion.

Recommended first implementation: first-party server endpoint or Supabase Edge Function for validation/rate limits, private event table, daily aggregates and admin-only aggregate queries. Proposed default: collection begins only after explicit analytics opt-in, with no pre-consent event queue or replay. Keep the session identifier in sessionStorage, reset it after 30 minutes of inactivity, and clear it and stop collection on withdrawal. Use no persistent visitor identifier in the first release. A session-only consent choice can be remembered for that tab; a new tab may require a new choice. Present this accessibly without blocking the portfolio. This is a product default, not a statement of legal compliance for every audience.

Consequently, Release B reports opted-in observed sessions and their conversion rates, not all visitors or returning visitors. Clearly label this coverage and the separate-tab limitation. Returning-visitor metrics require a later explicit identifier/retention decision and corresponding consent design. Where identifiers are unavailable, do not infer unique visitors. No collection on admin/login routes; exclude identified admin sessions. Public content and forms must work when analytics is declined or blocked.

The authenticated admin controls aggregation queries, not event payloads sent by visitors. Public telemetry is untrusted and can contain bots; label observed traffic and disclose filtering limits. Avoid asserting exact unique-human counts.

### Metric rules

- Define one session as an observed browsing window with 30 minutes of inactivity ending the window. Document identifier limitations and storage behavior.
- Report events/visits from the collection start forward. Show “Not collected” for earlier periods; a missing data period is not zero traffic.
- Use Asia/Kolkata as the default reporting timezone; timestamp storage remains UTC. Date filters use inclusive start/exclusive end boundaries.
- A session conversion is counted once even if it submits multiple messages. Keep total enquiries as a separate count.
- Session-attributed conversion requires a valid validated event link; historical messages remain enquiries without invented visitor attribution.
- Associate a contact with the most recent project_view in the same session, clearly labelled last-project attribution. Mark unknown when absent; never silently guess.
- Previous-period delta: `(current - previous) / previous`; show “New” or unavailable when previous is zero, never Infinity. Allow incomplete-period comparisons only with an explicit label.
- A funnel uses ordered events within the same observed session and window; independent raw event counts are not a funnel.
- Small samples show sample size and restrained interpretation. No unsupported causal or statistical significance claims.
- Proposed raw-event retention: 90 days; aggregate retention: 12 months. Make this configurable, with a verified pruning job before promising deletion behavior.

## 7. Data and access changes

Create additive versioned migrations; preserve existing IDs, uppercase project fields, visitor comments, private enquiries and owner profiles. Do not rerun a destructive blanket policy replacement to add analytics.

Proposed additions, introduced only when their module is built:

- `analytics_events`: private validated event storage, deduplication key and indexes on reporting time/event/project.
- `analytics_daily`: daily dimension aggregates with a documented aggregation version and timezone.
- `contact_message_details`: message_id, manual status, tags, notes and timestamps; admin-only. Keep visitor-controlled insert RPC independent of these fields.
- `contact_stage_events`: transitions needed for later pipeline reporting; do not reconstruct history from current status.
- `admin_audit_events`: server-written actor/action/entity/time metadata without message bodies or secrets.
- `report_presets`: owner-scoped names and allowlisted filter definitions.
- `site_content_versions`: later CMS revisions, with a deliberate public published-content read boundary.

Public users cannot read analytics, reports, audit events, profiles belonging to others or private contacts. Ordinary authenticated users remain unable to administer content. Analytics writes go through a validated endpoint; the browser cannot select an admin role, overwrite aggregate counts or supply trusted audit actors.

Admin analytics functions must explicitly verify the owner/admin role. Prefer security-invoker views when relying on underlying RLS; security-definer functions need narrow grants, a fixed search path and an internal authorization check. Secrets stay server-side. Do not ask for service-role secrets in chat.

## 8. Delivery sequence and checkpoints

| Stage | Deliverable | Exit condition |
| --- | --- | --- |
| 0. Baseline | Current flow inventory, screenshots, schema/access review, performance and accessibility baseline | Known routes and workflows documented; existing tests/build results recorded |
| 1. Design | Public homepage and admin overview/inbox mockups, mobile variants, tokens and component contract | One coherent direction approved before broad implementation |
| 2. Admin foundation | New shell/login, overview from existing data, shared tables/forms | Protected navigation, keyboard/mobile behavior, real counters and all existing operations work |
| 3. Public site | Hero, work, case studies, about/contact, motion consolidation | Resume/contact/guestbook/direct project links preserved; no compulsory intro |
| 4. Data collection | Versioned event contract, ingestion endpoint, RLS migrations and validation | Real test events recorded once; no PII; no public analytics reads; no dependence on telemetry for forms |
| 5. Analytics | Acquisition, engagement, defined funnels, project ranking, comparison/export | Fixture-calculated metrics match SQL/UI; filters and CSV agree; no production fake data |
| 6. Inbox and reports | Status/tags/notes/history, saved views, CSV | Persistence, authorization, partial failure handling and empty states verified |
| 7. Release | Preview review, migration rollout, production checks and rollback instructions | Deployed build/routes verified, smoke checks pass, monitoring and collection start documented |

Ship one stage at a time. Stage 2 delivers a useful admin before enough analytics traffic exists. Do not make every future module a prerequisite for improving today's experience.

## 9. Verification and acceptance

- Preserve passing backend, contact notification, migration and pagination tests; run the existing `npm test` and production build before release. Record baseline lint failures separately and resolve affected-file issues.
- Add meaningful tests for metric boundaries, duplicate retries, previous-period zero, session funnel ordering, conversion deduplication, timezone boundaries and migration preservation.
- Test anonymous, ordinary authenticated and owner-admin access to each new table/function, including cross-user report access and unauthorized writes.
- Verify `/admin`, `/login`, `/dashboard/*`, direct project routes, unknown routes, refresh, session expiry and sign-out. Never bypass authorization to make a demo work.
- Check saved messages after refresh, email notification failure behavior, guestbook moderation and résumé download independently.
- Search/filter/sort/pagination/export operate over the full filtered dataset, with server-side pagination where needed. Export must not silently include only the visible page; neutralize spreadsheet formula injection in CSV text cells.
- Show loading, empty, unavailable, error and populated states. Test 0, 1 and many rows. Fixtures belong in development/tests only and are visibly labelled in mockups.
- Review desktop at 1440px, tablet at 768px and mobile at 390px. No horizontal page overflow, clipped menus or inaccessible controls. Tables can have a labelled intentional horizontal scroll region.
- Keyboard access, focus visibility/return, labels, landmarks, non-color status cues, readable contrast and reduced motion are required. Charts have a summary and accessible table alternative.
- Use LCP <=2.5s, INP <=200ms and CLS <=0.1 as field performance targets at the 75th percentile when adequate traffic exists. Use lab measurements as provisional checks, not proof of field performance. Lazy-load admin charting and keep analytics/chart bundles out of the public entry path.
- Every action is functional or clearly unavailable with an explanation. No decorative search fields, invented statistics, fake success notifications or dead export buttons.

## 10. Decisions proposed for review

Recommended defaults: editorial dark public site; light-first admin with optional dark mode; existing React/Vite stack; existing Framer Motion; first-party analytics; manual opportunity management; Asia/Kolkata reporting; no identity/job-history fabrication.

Remaining implementation dependencies: approval of the screen mockups, suitable Supabase deployment access for new migrations/functions, and a separate verified mail provider only if actual admin-composed email is added. These do not prevent design work, source implementation, local tests or useful overview metrics from existing data.

## References

- Motion accessibility: https://motion.dev/docs/react-use-reduced-motion — adapt motion to the user's preference; use the API exported by the installed Framer Motion version unless deliberately upgrading.
- Supabase views and RLS: https://supabase.com/docs/guides/database/views and https://supabase.com/docs/guides/database/postgres/row-level-security — preserve underlying row access in analytical views.
