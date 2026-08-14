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
- **`shipped_quantity ≤ ordered_quantity` is not enforced by the DB.** The schema documents the rule, but it's app logic only. Any code creating deliveries must check this.
- **`po_product` was originally named `po_product_pivot`.** Old references or tooling may use the old name.

## Status

No source code yet. This repo contains design artifacts only.
