# PO-Product Pivot: Order Truth, Not Shipment Truth

The PO-Product pivot table (`po_product`) links a PO to the products it contains, storing the **ordered quantity** per product. This is distinct from `delivery`, which stores the **shipped quantity** per product per shipment.

**Why keep the pivot:**
- Ordered quantity must be stored per-product per-PO, not per-delivery (multiple deliveries for the same product would need redundant `ordered_quantity` values).
- The pivot is the single source of truth for "what was ordered." Delivery is the single source of truth for "what was shipped."
- No overlap, no duplication, clear separation of concerns.

**Why not put ordered quantity on delivery:**
- A PO can have multiple deliveries for the same product (staggered shipments). Storing `ordered_quantity` on each delivery row creates redundancy and edit-risk — changing one row wouldn't update the others.
