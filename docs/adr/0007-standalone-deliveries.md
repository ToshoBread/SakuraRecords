# Standalone Deliveries: Optional PO Link

**Context:** Deliveries currently require a `poid` (NOT NULL FK→purchase_order). Every shipment must belong to a purchase order.

**Decision:** Make `delivery.poid` nullable. A delivery may be **standalone** (no PO) or **linked** to a PO.

```sql
ALTER TABLE delivery ALTER COLUMN poid DROP NOT NULL;
```

**Standalone delivery:**

- `unit_price` is manually entered by the user (no PO-product price to derive from).
- No ordered-quantity budget to check against — the shipment is its own record.
- Can be linked to a PO later via `link_delivery_to_po()` (sets `poid` retroactively).

**PO-linked delivery:**

- `unit_price` is auto-derived from `po_product.price_per_kg`.
- Subject to the shipped-vs-ordered budget check.

## Why

- Some shipments have no associated purchase order: retail sales, samples, field deliveries.
- Operators may record a delivery first, then realize a PO should back it — linking later keeps the audit trail intact.
- Avoids duplicating tables or overloading the PO entity with delivery-only records.

## Business Rules

- Only deliveries with `delivered = true` count toward shipped totals. (See ADR-0001 for the shipped/ordered separation.)
- The shipped-quantity ≤ ordered-quantity check applies **only** to PO-linked deliveries. Stale triggers skip the check when `poid IS NULL`. Standalone deliveries are exempt. (See ADR-0005 for the dual-layer enforcement pattern.)
- A PO may contain only linked deliveries; standalone deliveries float free.

## Consequences

- Foreign-key index on `delivery.poid` now allows NULLs — expected, no action needed.
- Client-side: `link_delivery_to_po()` must re-validate the shipped-quantity budget before committing the link, to avoid backfilling an over-shipped PO.
- Reporting queries that join `delivery → purchase_order` must use LEFT JOIN or filter `poid IS NOT NULL`.
