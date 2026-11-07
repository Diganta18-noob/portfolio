# Portfolio UX pattern implementation

The visual design remains the restored portfolio design.

Implemented in this increment: admin command palette (Ctrl/Command+K, arrows, Enter, Escape), debounced sender search, request-order protection, inbox skeletons, optimistic read/unread updates with rollback, retry action, and navigation button labels.

Existing: persistent responsive sidebar, loading/empty states, project skeletons, protected deletion dialogs, and custom 404.

Still to implement deliberately: project draft autosave (without automatically publishing), bulk list actions, reusable sortable table, richer date/status filters, and systematic field-level validation. Throttling already exists for session sampling; do not add arbitrary delays to unrelated actions.

Not applicable to this owner-managed portfolio: paid plan badges, referral rewards, and new-user signup onboarding. Do not invent subscriptions, rewards or visitors.

Second increment: project local draft autosave (restore/discard, saved-state text, clear after successful submission), title/HTTP URL validation, optional sortable/selectable table with default card view preserved, combined technology/title and publication filters, and acknowledged bulk publish/unpublish. Selected rows clear when filters change; bulk operation verifies affected row count. Images are not saved in local drafts. Multi-rule AND/OR filters, adjustable column widths and bulk delete are not implemented.
