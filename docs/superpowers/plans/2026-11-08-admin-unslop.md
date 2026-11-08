# Admin portal refinement implementation plan

**Goal:** Apply the user-approved graphite and blue direction to the existing portfolio administration workspace.

**Direction:** Calm, precise, personal. A developer's publishing desk. Project images and observed analytics carry the color; monospace metadata and keycaps form the signature.

**Architecture:** Retain React, Vite, Tailwind, current routes and Supabase operations. Add a scoped admin stylesheet and explicit semantic component styles. Keep public portfolio styling independent.

**Attribution:** Design process adapted from Unslop by Damir Sokolovsky, https://github.com/heydamir/unslop (CC BY 4.0).

## Tasks
- [x] Replace the dashboard shell with opaque graphite navigation, accessible mobile drawer, breadcrumb toolbar, and existing quick navigation.
- [x] Apply Unslop passes in order: spacing, neutral surfaces and blue accent, Lucide icons, sentence-case copy, system typography and monospace metadata, fluid layout, controls and table details, actual product imagery, restrained motion.
- [x] Carry the same treatment through projects, certificates, comments, messages, analytics, sign-in and feedback dialogs without changing data operations.
- [x] Run production build, existing tests and targeted lint. Inspect browser rendering and report any verification limits.

## Review focus
Preserve authentication and all CRUD behavior. Maintain visible keyboard focus, readable muted text, mobile navigation, usable table overflow, and dialog contrast. No new dependencies or fictional metrics. Styling-only changes use build and visual checks instead of implementation-mirroring tests.

## Verification
- Production build passed; 36 existing tests passed.
- Browser inspected desktop projects and the mobile inbox/editor at 390px. Drawer navigation and native dialog Escape closure verified using an isolated backend stub; live authenticated mutations were not exercised.
- Baseline ESLint comparison: all reported finding categories already exist in HEAD. Dashboard shell, sign-in and command navigation checked separately.
- No new dependencies. Temporary preview files and backend stub removed after visual checks.
