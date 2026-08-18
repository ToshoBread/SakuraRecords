-- SakuraRecords — Seed Data

-- Lookup tables
INSERT INTO transaction_document (document) VALUES
  ('DR & SI'),
  ('Delivery Receipt'),
  ('Sales Invoice');

INSERT INTO delivery_requirement (requirement) VALUES
  ('COA & PO'),
  ('Certificate of Analysis'),
  ('Purchase Order');

-- Clients
INSERT INTO client (id, name) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Acme Corporation'),
  (2, 'Globex Industries'),
  (3, 'Initech Solutions');

SELECT setval('client_id_seq', 3);

-- Addresses
INSERT INTO address (clientid, name, address) VALUES
  (1, 'Main Warehouse', '123 Industrial Ave, Makati City'),
  (1, 'Branch Office', '456 Commerce St, Pasig City'),
  (2, 'Head Office', '789 Corporate Blvd, BGC, Taguig'),
  (2, 'Storage Facility', '321 Logistics Rd, Muntinlupa City'),
  (3, 'Office HQ', '555 Tech Park, Quezon City'),
  (3, 'Receiving Dock', '888 Warehouse Ln, Las Pinas City');

-- Products
INSERT INTO product (id, name, code, description) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Industrial Bearing 6205', 'BRG-6205', 'Deep groove ball bearing, 25x52x15mm'),
  (2, 'Stainless Steel Bolt M10', 'BLT-M10SS', 'Grade 316 stainless steel, 40mm length'),
  (3, 'Hydraulic Hose 1/2"', 'HYD-H12', 'High-pressure hydraulic hose, 2-meter length'),
  (4, 'Electric Motor 5HP', 'MOT-5HP', 'Single-phase induction motor, 220V'),
  (5, 'Conveyor Belt Roll', 'CNV-ROLL', 'PVC conveyor belt, 500mm wide, 10m roll');

SELECT setval('product_id_seq', 5);

-- Purchase Orders
INSERT INTO purchase_order (id, clientid, notes) VALUES
  ('PO-2026-001', 1, 'Q3 restocking order'),
  ('PO-2026-002', 2, 'Urgent replacement parts'),
  ('PO-2026-003', 3, 'New facility setup');

-- PO-Product pivots
INSERT INTO po_product (poid, productid, ordered_quantity) VALUES
  ('PO-2026-001', 1, 100),
  ('PO-2026-001', 2, 500),
  ('PO-2026-001', 3, 20),
  ('PO-2026-002', 4, 5),
  ('PO-2026-002', 5, 3),
  ('PO-2026-003', 1, 50),
  ('PO-2026-003', 3, 10),
  ('PO-2026-003', 4, 2);

-- Deliveries
INSERT INTO delivery (poid, productid, shipped_quantity, unit_price, delivery_date, payment_terms, delivered, addressid, transactiondocumentid, deliveryrequirementid) VALUES
  -- PO-2026-001: Partial deliveries for Acme
  ('PO-2026-001', 1, 60, 450.00, '2026-07-15', 30, true,  1, 1, 1),
  ('PO-2026-001', 1, 40, 450.00, '2026-08-01', 30, false, 1, 1, 1),
  ('PO-2026-001', 2, 500, 25.50, '2026-07-20', 15, true,  2, 2, 2),
  ('PO-2026-001', 3, 10, 1200.00, '2026-08-10', 30, false, 1, 1, 3),
  -- PO-2026-002: Full delivery for Globex
  ('PO-2026-002', 4, 5, 15000.00, '2026-08-05', 45, true,  3, 1, 1),
  ('PO-2026-002', 5, 3, 8500.00, '2026-08-12', 45, true,  4, 1, 1),
  -- PO-2026-003: In-transit for Initech
  ('PO-2026-003', 1, 25, 475.00, '2026-08-15', 30, false, 5, 3, 3),
  ('PO-2026-003', 4, 2, 14500.00, '2026-08-20', 60, false, 6, 1, 1);
