# SakuraRecords

A system for tracking client purchases, deliveries, and generating sales/statistics reports. Focused on retrospective reporting — no delivery workflow tracking.

## Language

**Client**:
An entity that places purchase orders. Has an auto-generated integer ID. Soft-deletable via `deleted_at`.
_Avoid_: Customer, buyer, account

**Product**:
A sellable item. Has an auto-generated integer ID. The `code` field is a user-supplied, editable reference code (e.g., "A2B4-32GQ") — not a stable identifier for relationships. Soft-deletable via `deleted_at`.
_Avoid_: Item, SKU, goods

**Purchase Order (PO)**:
A record of products a client has ordered, identified by a user-supplied reference number (VARCHAR ID). Must contain at least one delivery. Soft-deletable (admin only).
_Avoid_: Order, sales order

**PO-Product Pivot**:
Links a PO to the products it contains, with the ordered quantity per product. The source of truth for "what was ordered." A product must appear in at least one delivery to be part of a PO.
_Avoid_: order_item, line_item

**Delivery**:
A shipment of a specific product from a PO, on a specific date. Records the shipped quantity and unit price. A delivery cannot exist without a PO; a PO must contain deliveries. The ordered quantity lives on the PO-Product pivot, not on the delivery. The total shipped quantity across all deliveries for a given product in a PO must not exceed the ordered quantity on the PO-Product pivot.
_Avoid_: Shipment, consignment

**Address**:
A client-assigned location where deliveries are sent. Identified by a label (name) and freeform address text. Belongs to a client. Soft-deletable via `deleted_at`.
_Avoid_: Location, warehouse

**Transaction Document**:
A reference lookup for the type of documentation accompanying a delivery (e.g., "Delivery Receipt and Sales Invoice", "Sales Invoice Only"). Global enum, may grow over time.

**Delivery Requirement**:
A reference lookup for special instructions or requirements attached to a delivery (e.g., "Certificate of Analysis and Purchase Order", "COA Only"). Global enum, may grow over time.
