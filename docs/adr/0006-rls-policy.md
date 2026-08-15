# RLS Policy: Role-Based Access Control

**Two roles:** Admin (developer) and Operator (user)

**Role storage:** Supabase Auth user metadata (`app_metadata.role`). No separate profiles table.

**Access matrix:**

| Table                | Admin                   | Operator                     |
| -------------------- | ----------------------- | ---------------------------- |
| client               | Full CRUD + Hard Delete | Full CRUD (soft delete only) |
| product              | Full CRUD + Hard Delete | Full CRUD (soft delete only) |
| address              | Full CRUD + Hard Delete | Full CRUD (soft delete only) |
| purchase_order       | Full CRUD + Hard Delete | Full CRUD (soft delete only) |
| po_product           | Full CRUD + Hard Delete | Read + Insert                |
| delivery             | Full CRUD + Hard Delete | Full CRUD (soft delete only) |
| transaction_document | Full CRUD + Hard Delete | Full CRUD (soft delete only) |
| delivery_requirement | Full CRUD + Hard Delete | Full CRUD (soft delete only) |

**Soft delete vs Hard delete:**

- Operator can only soft delete (set `deleted_at` timestamp) on allowed tables
- Admin can hard delete (permanently remove row) via PostgreSQL function
- POs and deliveries can only be soft-deleted by admin (historical records)

**Auth:** Supabase Auth with email/password. No public signup. Pre-seeded accounts only.
