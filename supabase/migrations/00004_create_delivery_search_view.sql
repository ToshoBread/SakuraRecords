-- SakuraRecords — Delivery search view
-- ADR-0007 established delivery.clientid as a direct FK to client.
-- This view flattens joined columns so PostgREST can filter/search
-- across product name, product code, PO number, client name, etc.
-- in a single query without nested-resource filtering limitations.
-- Used by DeliveryListView for server-side pagination + search.

CREATE OR REPLACE VIEW delivery_search AS
SELECT
  d.id,
  d.poid,
  d.clientid,
  d.productid,
  d.shipped_quantity,
  d.unit_price,
  d.delivery_date,
  d.payment_terms,
  d.delivered,
  d.addressid,
  d.transactiondocumentid,
  d.deliveryrequirementid,
  d.created_at,
  d.updated_at,
  d.deleted_at,
  d.addressid AS address_clientid,
  p.name      AS product_name,
  p.code      AS product_code,
  c.name      AS direct_client_name,
  po.id       AS po_number,
  addr.name   AS address_name,
  COALESCE(c.name, po_client.name, addr_client.name) AS client_name,
  po_client.name AS po_client_name,
  td.document AS transaction_document_name,
  dr.requirement AS delivery_requirement_name
FROM delivery d
LEFT JOIN product        p  ON d.productid = p.id
LEFT JOIN client         c  ON d.clientid  = c.id
LEFT JOIN purchase_order po ON d.poid      = po.id
LEFT JOIN client         po_client ON po.clientid = po_client.id
LEFT JOIN address        addr ON d.addressid = addr.id
LEFT JOIN client         addr_client ON addr.clientid = addr_client.id
LEFT JOIN transaction_document td ON d.transactiondocumentid = td.id
LEFT JOIN delivery_requirement dr ON d.deliveryrequirementid = dr.id
WHERE d.deleted_at IS NULL;

-- Computed client name: prefer direct delivery.clientid, fall back to PO client
-- Exposed as a generated column for easy filtering
-- (PostgREST can filter on any column the view exposes)

-- Allow anon/authenticated to read the view
GRANT SELECT ON delivery_search TO authenticated, anon;
