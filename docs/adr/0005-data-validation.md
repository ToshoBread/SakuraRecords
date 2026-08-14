# Data Validation: Dual-Layer Enforcement

**Client-side:** Zod schemas + VeeValidate for form validation in Vue
**Server-side:** PostgreSQL triggers for business rule enforcement

**Why both:**
- Client-side gives immediate feedback to the user (fast UX)
- Server-side enforces rules even if the client is bypassed (data integrity)
- Defense in depth — no single point of failure

**The critical business rule:** `shipped_quantity ≤ ordered_quantity - total_already_shipped`

The total shipped quantity across all deliveries for a given product in a PO must not exceed the ordered quantity on the PO-Product pivot. This is enforced at both layers:

1. **Vue form** — Fetches remaining quantity before submission, shows error immediately
2. **PostgreSQL trigger** — Same calculation, rejects invalid inserts/updates at the DB level

**Validation layers:**

| Layer | What it validates | Tool |
|-------|------------------|------|
| **Schema** | Types, required fields, ranges (≥ 0) | Zod |
| **Form** | Field-level errors, submission flow | VeeValidate |
| **Business rules** | Cross-table constraints (shipped vs ordered) | PostgreSQL trigger |
