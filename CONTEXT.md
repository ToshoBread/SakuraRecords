# SakuraRecords

A system for tracking client purchases, deliveries, and generating sales/statistics reports. Focused on retrospective reporting — no delivery workflow tracking.

## Language

**Client**:
An entity that places purchase orders. Has an auto-generated integer ID. Soft-deletable via `deleted_at`.
_Avoid_: Customer, buyer, account

**Product**:
A sellable item. Has an auto-generated integer ID. The `code` field is a user-supplied, editable reference code (e.g., "A2B4-32GQ") — not a stable identifier for relationships. The `kg` field stores informational weight per unit. Soft-deletable via `deleted_at`.
_Avoid_: Item, SKU, goods

**Purchase Order (PO)**:
A record of products a client has ordered, identified by a user-supplied reference number (VARCHAR ID). Must contain at least one delivery. Soft-deletable (admin only).
_Avoid_: Order, sales order

**PO-Product Pivot**:
Links a PO to the products it contains, with the ordered quantity per product and `price_per_kg` (₱/kg for this order). The source of truth for "what was ordered" and "at what price." A product must appear in at least one delivery to be part of a PO.
_Avoid_: order_item, line_item

**Delivery**:
A shipment of a specific product on a specific date. The `poid` is optional — a delivery may be **standalone** (no PO) or **linked** to a PO. `unit_price` is manual entry for standalone deliveries; auto-derived from `po_product.price_per_kg` when created from a PO. The `delivered` flag indicates whether the shipment has been received — only deliveries with `delivered = true` count toward the shipped total. A standalone delivery can be linked to a PO later via `link_delivery_to_po()`. The ordered quantity lives on the PO-Product pivot. The total shipped quantity across all delivered deliveries for a given product in a PO must not exceed the ordered quantity on the PO-Product pivot (enforced by trigger; skipped for standalone).
_Avoid_: Shipment, consignment

**Address**:
A client-assigned location where deliveries are sent. Identified by a label (name) and freeform address text. Belongs to a client. Soft-deletable via `deleted_at`.
_Avoid_: Location, warehouse

**Transaction Document**:
A reference lookup for the type of documentation accompanying a delivery (e.g., "DR & SI", "DR", "SI"). Global enum, may grow over time. "Both" options listed first.

**Delivery Requirement**:
A reference lookup for special instructions or requirements attached to a delivery (e.g., "COA & PO", "COA", "PO"). Global enum, may grow over time. "Both" options listed first.
