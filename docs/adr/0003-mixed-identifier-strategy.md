# Mixed Identifier Strategy: INTEGER vs VARCHAR Primary Keys

Entities use different primary key types based on their identifier source:

- **INTEGER auto-increment**: `client`, `product`, `delivery`, `address`, `transaction_document`, `delivery_requirement` — system-generated IDs, no external reference needed.
- **VARCHAR**: `purchase_order` — user-supplied reference number (the PO number from the client).
- **Composite (VARCHAR + INTEGER)**: `po_product` — composite PK of `poId` (VARCHAR FK→purchase_order) + `productId` (INTEGER FK→product).

**Why mixed:**
- Purchase orders have a meaningful, user-supplied identifier (the PO number). Using it as the PK avoids a redundant surrogate key and makes the PO number directly accessible without a separate lookup.
- Other entities have no meaningful external identifier. Auto-generated integers are simpler and smaller.
- `po_product` is a pivot table — composite PK ensures uniqueness (one product per PO) without a separate surrogate key.

**Consequence:** FK relationships to `purchase_order` use VARCHAR, while all others use INTEGER. This is a minor inconsistency but justified by the natural key on PO.
