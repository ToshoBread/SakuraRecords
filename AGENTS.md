# SakuraRecords

Client management and delivery tracking system. Pre-implementation — design phase only.

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

No source code yet. This repo contains design artifacts only.
