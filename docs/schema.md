# SakuraRecords — Database Schema

## Tables

### client
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| name | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

### address
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| clientid | INTEGER | FK→client, NOT NULL |
| name | VARCHAR(255) | NOT NULL (label) |
| address | VARCHAR(255) | NOT NULL (freeform) |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

### product
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| name | VARCHAR(255) | NOT NULL |
| code | VARCHAR(255) | UNIQUE, NOT NULL (editable reference) |
| description | TEXT | NULL (optional) |
| kg | NUMERIC | NOT NULL, DEFAULT 0 (informational) |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

### purchase_order
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR(255) | PK (user-supplied PO number) |
| clientid | INTEGER | FK→client, NOT NULL |
| notes | TEXT | NULL (optional) |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

### po_product (pivot)
| Column | Type | Constraints |
|--------|------|-------------|
| poid | VARCHAR(255) | FK→purchase_order, PK |
| productid | INTEGER | FK→product, PK |
| ordered_quantity | NUMERIC | NOT NULL, CHECK >= 0 |
| price_per_kg | NUMERIC | NOT NULL, DEFAULT 0 (₱/kg for this order) |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

### delivery
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| poid | VARCHAR(255) | FK→purchase_order, NOT NULL |
| productid | INTEGER | FK→product, NOT NULL |
| shipped_quantity | NUMERIC | NOT NULL, CHECK >= 0 |
| unit_price | NUMERIC | NOT NULL, CHECK >= 0 |
| delivery_date | DATE | NOT NULL |
| payment_terms | INTEGER | NOT NULL, DEFAULT 30 |
| delivered | BOOLEAN | NOT NULL, DEFAULT false |
| addressid | INTEGER | FK→address, NOT NULL |
| transactiondocumentid | INTEGER | FK→transaction_document, NOT NULL |
| deliveryrequirementid | INTEGER | FK→delivery_requirement, NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

**Business rule:** The total `shipped_quantity` across all **delivered** deliveries for a given product in a PO must not exceed the `ordered_quantity` on the corresponding `po_product` row. Only deliveries with `delivered = true` count toward the shipped total. Enforced by PostgreSQL trigger and client-side validation (see ADR-0005).

### transaction_document
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| document | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

Lookup values: "DR & SI", "DR", "SI", etc. ("Both" options listed first.)

### delivery_requirement
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| requirement | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | NULL (soft delete) |

Lookup values: "COA & PO", "COA", "PO", etc. ("Both" options listed first.)

## Relationships

```
client (1) ──→ (N) address
client (1) ──→ (N) purchase_order
purchase_order (1) ──→ (N) po_product
product (1) ──→ (N) po_product
purchase_order (1) ──→ (N) delivery
product (1) ──→ (N) delivery
address (1) ──→ (N) delivery
transaction_document (1) ──→ (N) delivery
delivery_requirement (1) ──→ (N) delivery
```

## Reporting Queries

- **Total quantity per product per month:** `SUM(delivery.shipped_quantity)` WHERE `delivered = true` GROUP BY product, month(delivery_date)
- **Client with highest gross sales per month:** `SUM(shipped_quantity × unit_price)` WHERE `delivered = true` JOIN purchase_order GROUP BY client, month
- **Product with highest gross sales per month:** `SUM(shipped_quantity × unit_price)` WHERE `delivered = true` JOIN product GROUP BY product, month
