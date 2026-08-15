# SakuraRecords

Client management and delivery tracking system. Phase 1 (MVP) implementation in progress.

## Domain

See `CONTEXT.md` for the glossary. Key terms: Client, Product, Purchase Order (PO), Delivery, PO-Product Pivot.

## Schema

`docs/SakuraRecords_schema.json` is the source ERD. `docs/schema.md` is the human-readable version with all constraints and relationships. Database target is **PostgreSQL**.

Single currency: **Philippine peso (₱)**. No currency column — all monetary values are peso.

## Decisions

`docs/adr/` contains architecture decision records. Read these before making schema changes.

## Gotchas

- **`payment_terms` is per-delivery, not per-PO.** Most schemas put payment terms on the order. Ours is on delivery because terms can vary per shipment.
- **The user is non-tech-savvy.** Every UI decision should optimize for simplicity. Large touch targets, minimal navigation, clear labels. When in doubt, choose the simpler option.

## Status

Vue 3 + Vite + TypeScript project initialized. Tailwind CSS, shadcn-vue, @supabase/supabase-js, and @vueuse/core installed. Ready for UI/UX implementation.

## Skills

Invoke these skills when working on the corresponding areas:

| Skill                              | When to use                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `vue-best-practices`               | Before writing any Vue component — Composition API patterns, component boundaries, composable extraction                  |
| `vue`                              | When writing Vue SFCs — defineProps/defineEmits/defineModel, watchers, Transition/Teleport/Suspense/KeepAlive             |
| `shadcn-vue`                       | Before adding or using any UI component — correct component patterns (FieldGroup, Sheet, Table, gap-*, data-icon)         |
| `ui-ux-pro-max`                    | During UI implementation — design system guidance, accessibility checks, touch targets, responsive patterns               |
| `frontend-design`                  | When building UI pages/components — high design quality, distinctive polish, avoiding generic AI aesthetics               |
| `vueuse-functions`                 | When implementing composables — useBreakpoints, useDebounceFn, onClickOutside, useScrollLock, etc.                        |
| `supabase`                         | When working with Supabase — RLS gotchas, auth patterns, data fetching security                                           |
| `supabase-postgres-best-practices` | When writing or optimizing Postgres queries, schema designs, or database configurations                                   |
| `typescript-advanced-types`        | When implementing complex type logic, reusable type utilities, or compile-time type safety                                |
| `subagent-driven-development`      | When executing the implementation plan — fresh subagent per task, two-stage review                                        |
| `brainstorming`                    | Only if new features are proposed during implementation — design questions                                                |
| `grill-with-docs`                  | When refining specs or design decisions — stress-test against domain model, sharpen terminology, update CONTEXT.md inline |
