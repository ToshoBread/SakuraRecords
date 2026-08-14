# Soft Delete for All Entities

All entities use soft delete via a `deleted_at` timestamp column. When `deleted_at` is NULL, the record is active. When set, the record is inactive but preserved for historical reporting.

**Why soft delete:**
- A reporting system must preserve historical data. Deleting a client would orphan their purchase orders and deliveries in reports.
- Soft delete allows hiding inactive records from UI while keeping them in aggregates.

**Hard delete (admin-only):**
- Hard delete permanently removes a row from the database.
- Only admin can hard delete, via a PostgreSQL function.
- Operator can only soft delete (set `deleted_at`).

**Implementation:** `deleted_at TIMESTAMP NULL` on all tables. Queries filter by `deleted_at IS NULL` for active records.
