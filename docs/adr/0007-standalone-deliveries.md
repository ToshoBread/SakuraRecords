# Standalone Deliveries: Optional PO Link

**Context:** Deliveries currently require a `poid` (NOT NULL FK→purchase_order). Every shipment must belong to a purchase order.

**Decision:** Make `delivery.poid` nullable. Add `delivery.clientid` as a direct FK to `client(id)` so standalone deliveries carry their own client reference — no PO lookup needed for client-based reporting.

```sql
ALTER TABLE delivery ALTER COLUMN poid DROP NOT NULL;

ALTER TABLE delivery
  ADD COLUMN clientid INTEGER REFERENCES client(id) ON DELETE SET NULL;
```

**Standalone delivery:**

- `clientid` is set directly — the delivery knows its client without a PO.
- `unit_price` is manually entered by the user (no PO-product price to derive from).
- No ordered-quantity budget to check against — the shipment is its own record.
- Can be linked to a PO later via `link_delivery_to_po()` (sets `poid` retroactively; `clientid` remains unchanged).

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
- Reporting queries that need the client can join `delivery.clientid` directly — no PO join required. Queries that also need PO context should use LEFT JOIN or filter `poid IS NOT NULL`.
- When linking a standalone delivery to a PO, `link_delivery_to_po()` should verify that `delivery.clientid = po.clientid` to maintain consistency.
