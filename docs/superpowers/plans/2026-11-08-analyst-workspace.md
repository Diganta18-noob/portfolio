# Analyst workspace redesign

User approved: ink sidebar and light report surfaces. Rebuild the information hierarchy, not just the palette. Use current React/Vite stack with no added dependencies.

## Implementation
- [x] Add tested daily activity bucketing in Asia/Kolkata with zero-filled days, unique daily sessions, exclusive period ends and aligned previous-period events.
- [x] Build a report canvas with comparable KPIs, a current/previous activity plot, ordered enquiry funnel, ranked project table, page engagement and expandable methodology/coverage.
- [x] Introduce white surfaces, ink navigation, precise typography, compact tables and a consistent control system across the portal. Make analytics the default destination; retain all CRUD, exports and authentication.
- [x] Improve project management with table-first presentation, thumbnails, publication state, edit/delete actions and content inventory counts.
- [x] Verify analytical edge cases, production build, lint baseline and desktop/mobile browser states using isolated fixtures. Push the finished redesign through the previously authorized repository workflow.

## Constraints
No fictional production figures. Do not call sessions unique people. Null conversion means no denominator. Funnel steps use ordered session events. Never infer email delivery or reply status. Coverage limitations belong in a discoverable details panel.

Design process: Unslop by Damir Sokolovsky, https://github.com/heydamir/unslop (CC BY 4.0).

## Verification evidence
- 38 tests pass, including two new daily activity tests (Kolkata midnight, zero filling, daily session deduplication, prior-period alignment and exclusive boundaries).
- Production build passes. Focused lint passes with the existing prop-types rule debt excluded.
- Browser QA on isolated, write-disabled fixtures: desktop overview and chart; 390px mobile chart, drawer and inbox; 7-day filtering, keyboard chart inspection, project search and edit dialog; session reporting; empty and unavailable analytics; sign-in controls.
- Mobile document width equals the viewport; workspace scrolling is contained. Fixture numbers were never written into production code or the backend.
- Independent review found one remaining pale validation color on the white editor; corrected to amber-800. No other significant findings.
- Temporary fixture source, backend and Vite configuration removed. Authenticated production mutations were not exercised.
