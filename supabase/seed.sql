-- SakuraRecords — Food Industry Seed Data

-- =============================================================================
-- Lookup Tables
-- =============================================================================

INSERT INTO transaction_document (document) VALUES
  ('DR & SI'),
  ('DR'),
  ('SI');

INSERT INTO delivery_requirement (requirement) VALUES
  ('COA & PO'),
  ('COA'),
  ('PO');

-- =============================================================================
-- Clients (Food businesses)
-- =============================================================================

INSERT INTO client (id, name) OVERRIDING SYSTEM VALUE VALUES
  (1, 'TasteBud Kitchen Supplies'),
  (2, 'Manila Flavor House'),
  (3, 'Cebu Processed Foods Corp'),
  (4, 'Davao Spice Trading'),
  (5, 'Metro Manila Food Hub'),
  (6, 'Luzon Snack Distributors');

SELECT setval('client_id_seq', 6);

-- =============================================================================
-- Addresses
-- =============================================================================

INSERT INTO address (clientid, name, address) VALUES
  (1, 'Main Warehouse', '123 Food St, Makati City'),
  (1, 'Branch Warehouse', '456 Industrial Ave, Pasig City'),
  (2, 'Head Office', '789 Flavor Blvd, BGC, Taguig'),
  (2, 'Cold Storage', '321 Cold Chain Rd, Muntinlupa City'),
  (3, 'Factory', '555 Processing Zone, Cebu City'),
  (3, 'Dispatch Center', '888 Logistics Ave, Cebu City'),
  (4, 'Spice Warehouse', '101 Spice Lane, Davao City'),
  (4, 'Grinding Facility', '202 Mill Rd, Davao City'),
  (5, 'Distribution Center', '303 Hub St, Quezon City'),
  (5, 'Receiving Dock', '404 Dock Ave, Manila'),
  (6, 'Main Depot', '505 Depot Rd, Caloocan City'),
  (6, 'Satellite Office', '606 Branch St, Valenzuela City');

-- =============================================================================
-- Products (Food items, flavorings, processed foods)
-- =============================================================================

INSERT INTO product (id, name, code, description, kg) OVERRIDING SYSTEM VALUE VALUES
  -- Flavorings & Seasonings
  (1, 'MSG Seasoning 1kg', 'FLV-MSG1K', 'Monosodium glutamate, food grade, 1kg pack', 1.0),
  (2, 'Black Pepper Ground 500g', 'FLV-BPG500', 'Fine ground black pepper, 500g', 0.5),
  (3, 'Garlic Powder 1kg', 'FLV-GPW1K', 'Dehydrated garlic powder, 1kg', 1.0),
  (4, 'Onion Powder 500g', 'FLV-ONP500', 'Dehydrated onion powder, 500g', 0.5),
  (5, 'Chili Flakes 250g', 'FLV-CHF250', 'Crushed red chili flakes, 250g', 0.25),
  -- Sauces & Condiments
  (6, 'Soy Sauce 1L', 'SCE-SOY1L', 'Premium soy sauce, 1-liter bottle', 1.1),
  (7, 'Fish Sauce 500ml', 'SCE-FSH500', 'Traditional fish sauce (patis), 500ml', 0.55),
  (8, 'Oyster Sauce 250g', 'SCE-OYS250', 'Thick oyster sauce, 250g bottle', 0.28),
  (9, 'Vinegar 1L', 'SCE-VIN1L', 'Cane vinegar, 1-liter', 1.05),
  -- Processed Foods
  (10, 'Instant Noodles 40-pack', 'PRC-INK40', 'Cup noodles variety pack, 40 cups', 8.0),
  (11, 'Canned Sardines 48-can', 'PRC-SRD48', 'Sardines in tomato sauce, 155g x 48', 8.5),
  (12, 'Canned Tuna 24-can', 'PRC-TNA24', 'Tuna flakes in oil, 180g x 24', 5.0),
  (13, 'Packaged Rice 25kg', 'PRC-RC25', 'Premium long grain rice, 25kg sack', 25.0),
  (14, 'Cooking Oil 5L', 'PRC-OIL5L', 'Refined palm cooking oil, 5-liter', 4.5),
  (15, 'Flour 10kg', 'PRC-FLR10K', 'All-purpose flour, 10kg sack', 10.0),
  -- Snacks
  (16, 'Prawn Crackers 1kg', 'SNK-PRC1K', 'Shrimp chips, 1kg bag', 1.0),
  (17, 'Banana Chips 500g', 'SNK-BCH500', 'Sweet dried banana chips, 500g', 0.5),
  (18, 'Pepperoni Sticks 1kg', 'SNK-PPT1K', 'Smoked pepperoni sticks, 1kg', 1.0),
  -- Beverages
  (19, 'Powdered Juice 1kg', 'BEV-JCE1K', 'Orange juice powder, 1kg jar', 1.0),
  (20, 'Coffee Mix 50-sachet', 'BEV-COF50', '3-in-1 instant coffee, 50 sachets', 1.5);

SELECT setval('product_id_seq', 20);

-- =============================================================================
-- Purchase Orders (spread across months for good report data)
-- =============================================================================

INSERT INTO purchase_order (id, clientid, notes) VALUES
  -- June 2026 orders
  ('PO-2026-001', 1, 'June restocking - seasonings'),
  ('PO-2026-002', 2, 'June order - sauces and condiments'),
  ('PO-2026-003', 3, 'June processed foods bulk order'),
  -- July 2026 orders
  ('PO-2026-004', 4, 'July spice order'),
  ('PO-2026-005', 5, 'July snack distribution'),
  ('PO-2026-006', 6, 'July beverage and rice order'),
  ('PO-2026-007', 1, 'Mid-year restocking'),
  -- August 2026 orders
  ('PO-2026-008', 2, 'August monthly supply'),
  ('PO-2026-009', 3, 'August canned goods reorder'),
  ('PO-2026-010', 4, 'August spice restocking'),
  ('PO-2026-011', 5, 'August mixed order'),
  ('PO-2026-012', 6, 'August snack bulk buy'),
  -- September 2026 orders
  ('PO-2026-013', 1, 'September seasonings'),
  ('PO-2026-014', 2, 'September sauces'),
  ('PO-2026-015', 3, 'September processed foods'),
  ('PO-2026-016', 5, 'September distribution order');

-- =============================================================================
-- PO-Product Pivots
-- =============================================================================

INSERT INTO po_product (poid, productid, ordered_quantity, price_per_kg) VALUES
  -- PO-2026-001: TasteBud seasonings
  ('PO-2026-001', 1, 200, 280.00),
  ('PO-2026-001', 2, 100, 450.00),
  ('PO-2026-001', 3, 150, 320.00),
  -- PO-2026-002: Manila Flavor sauces
  ('PO-2026-002', 6, 300, 85.00),
  ('PO-2026-002', 7, 200, 95.00),
  ('PO-2026-002', 8, 100, 180.00),
  ('PO-2026-002', 9, 150, 65.00),
  -- PO-2026-003: Cebu processed foods
  ('PO-2026-003', 10, 50, 120.00),
  ('PO-2026-003', 11, 30, 95.00),
  ('PO-2026-003', 12, 20, 110.00),
  -- PO-2026-004: Davao spices
  ('PO-2026-004', 2, 80, 440.00),
  ('PO-2026-004', 3, 120, 310.00),
  ('PO-2026-004', 5, 60, 520.00),
  -- PO-2026-005: Metro Manila snacks
  ('PO-2026-005', 16, 100, 220.00),
  ('PO-2026-005', 17, 80, 180.00),
  ('PO-2026-005', 18, 50, 350.00),
  -- PO-2026-006: Luzon beverages
  ('PO-2026-006', 13, 40, 55.00),
  ('PO-2026-006', 14, 60, 75.00),
  ('PO-2026-006', 19, 30, 140.00),
  ('PO-2026-006', 20, 25, 160.00),
  -- PO-2026-007: TasteBud mid-year
  ('PO-2026-007', 1, 100, 275.00),
  ('PO-2026-007', 4, 80, 340.00),
  ('PO-2026-007', 6, 200, 82.00),
  -- PO-2026-008: Manila Flavor August
  ('PO-2026-008', 6, 250, 86.00),
  ('PO-2026-008', 7, 180, 92.00),
  ('PO-2026-008', 9, 120, 68.00),
  -- PO-2026-009: Cebu August
  ('PO-2026-009', 10, 60, 118.00),
  ('PO-2026-009', 11, 40, 93.00),
  ('PO-2026-009', 12, 30, 108.00),
  -- PO-2026-010: Davao August
  ('PO-2026-010', 1, 150, 282.00),
  ('PO-2026-010', 2, 90, 445.00),
  ('PO-2026-010', 3, 100, 315.00),
  -- PO-2026-011: Metro Manila August
  ('PO-2026-011', 15, 50, 62.00),
  ('PO-2026-011', 16, 70, 215.00),
  ('PO-2026-011', 17, 60, 175.00),
  -- PO-2026-012: Luzon August
  ('PO-2026-012', 13, 35, 56.00),
  ('PO-2026-012', 18, 40, 345.00),
  ('PO-2026-012', 20, 30, 155.00),
  -- PO-2026-013: TasteBud September
  ('PO-2026-013', 1, 180, 285.00),
  ('PO-2026-013', 2, 70, 455.00),
  ('PO-2026-013', 5, 50, 510.00),
  -- PO-2026-014: Manila Flavor September
  ('PO-2026-014', 7, 150, 94.00),
  ('PO-2026-014', 8, 80, 178.00),
  ('PO-2026-014', 9, 100, 67.00),
  -- PO-2026-015: Cebu September
  ('PO-2026-015', 10, 45, 122.00),
  ('PO-2026-015', 11, 35, 96.00),
  -- PO-2026-016: Metro September
  ('PO-2026-016', 14, 50, 76.00),
  ('PO-2026-016', 15, 40, 60.00),
  ('PO-2026-016', 19, 20, 138.00);

-- =============================================================================
-- Deliveries (spread across June-September 2026)
-- =============================================================================

INSERT INTO delivery (poid, productid, shipped_quantity, unit_price, delivery_date, payment_terms, delivered, addressid, transactiondocumentid, deliveryrequirementid) VALUES
  -- === JUNE 2026 ===
  -- PO-2026-001: TasteBud seasonings (partial)
  ('PO-2026-001', 1, 100, 280.00, '2026-06-05', 30, true, 1, 1, 1),
  ('PO-2026-001', 2, 50, 450.00, '2026-06-10', 30, true, 1, 2, 2),
  ('PO-2026-001', 3, 75, 320.00, '2026-06-15', 30, true, 2, 1, 1),
  -- PO-2026-002: Manila Flavor sauces (full)
  ('PO-2026-002', 6, 300, 85.00, '2026-06-08', 15, true, 3, 1, 1),
  ('PO-2026-002', 7, 200, 95.00, '2026-06-12', 15, true, 3, 1, 1),
  ('PO-2026-002', 8, 100, 180.00, '2026-06-18', 15, true, 4, 1, 1),
  ('PO-2026-002', 9, 150, 65.00, '2026-06-22', 15, true, 4, 2, 3),
  -- PO-2026-003: Cebu processed (partial)
  ('PO-2026-003', 10, 30, 120.00, '2026-06-20', 30, true, 5, 1, 1),
  ('PO-2026-003', 11, 20, 95.00, '2026-06-25', 30, true, 6, 1, 1),

  -- === JULY 2026 ===
  -- PO-2026-001: TasteBud rest (partial)
  ('PO-2026-001', 1, 100, 280.00, '2026-07-02', 30, true, 1, 1, 1),
  -- PO-2026-004: Davao spices (full)
  ('PO-2026-004', 2, 80, 440.00, '2026-07-05', 30, true, 7, 1, 1),
  ('PO-2026-004', 3, 120, 310.00, '2026-07-10', 30, true, 7, 1, 1),
  ('PO-2026-004', 5, 60, 520.00, '2026-07-15', 30, true, 8, 1, 1),
  -- PO-2026-005: Metro Manila snacks (full)
  ('PO-2026-005', 16, 100, 220.00, '2026-07-08', 45, true, 9, 1, 1),
  ('PO-2026-005', 17, 80, 180.00, '2026-07-12', 45, true, 9, 1, 1),
  ('PO-2026-005', 18, 50, 350.00, '2026-07-18', 45, true, 10, 1, 1),
  -- PO-2026-006: Luzon beverages (full)
  ('PO-2026-006', 13, 40, 55.00, '2026-07-10', 30, true, 11, 1, 1),
  ('PO-2026-006', 14, 60, 75.00, '2026-07-15', 30, true, 11, 1, 1),
  ('PO-2026-006', 19, 30, 140.00, '2026-07-20', 30, true, 12, 1, 1),
  ('PO-2026-006', 20, 25, 160.00, '2026-07-25', 30, true, 12, 1, 1),
  -- PO-2026-007: TasteBud mid-year (partial)
  ('PO-2026-007', 1, 100, 275.00, '2026-07-22', 30, true, 2, 1, 1),
  ('PO-2026-007', 4, 80, 340.00, '2026-07-28', 30, true, 2, 1, 1),

  -- === AUGUST 2026 ===
  -- PO-2026-001: TasteBud rest (remaining)
  ('PO-2026-001', 3, 75, 320.00, '2026-08-01', 30, false, 1, 1, 1),
  -- PO-2026-007: TasteBud mid-year rest
  ('PO-2026-007', 6, 200, 82.00, '2026-08-05', 30, true, 1, 1, 1),
  -- PO-2026-008: Manila Flavor August (partial)
  ('PO-2026-008', 6, 150, 86.00, '2026-08-03', 15, true, 3, 1, 1),
  ('PO-2026-008', 7, 100, 92.00, '2026-08-08', 15, true, 4, 1, 1),
  -- PO-2026-009: Cebu August (partial)
  ('PO-2026-009', 10, 30, 118.00, '2026-08-10', 30, true, 5, 1, 1),
  ('PO-2026-009', 11, 20, 93.00, '2026-08-15', 30, true, 6, 1, 1),
  -- PO-2026-010: Davao August (full)
  ('PO-2026-010', 1, 150, 282.00, '2026-08-05', 30, true, 7, 1, 1),
  ('PO-2026-010', 2, 90, 445.00, '2026-08-10', 30, true, 8, 1, 1),
  ('PO-2026-010', 3, 100, 315.00, '2026-08-15', 30, true, 7, 1, 1),
  -- PO-2026-011: Metro Manila August (partial)
  ('PO-2026-011', 15, 50, 62.00, '2026-08-08', 45, true, 9, 1, 1),
  ('PO-2026-011', 16, 70, 215.00, '2026-08-12', 45, true, 10, 1, 1),
  -- PO-2026-012: Luzon August (full)
  ('PO-2026-012', 13, 35, 56.00, '2026-08-10', 30, true, 11, 1, 1),
  ('PO-2026-012', 18, 40, 345.00, '2026-08-15', 30, true, 12, 1, 1),
  ('PO-2026-012', 20, 30, 155.00, '2026-08-20', 30, true, 11, 1, 1),

  -- === SEPTEMBER 2026 ===
  -- PO-2026-003: Cebu rest
  ('PO-2026-003', 10, 20, 120.00, '2026-09-01', 30, true, 5, 1, 1),
  ('PO-2026-003', 12, 20, 110.00, '2026-09-05', 30, true, 6, 1, 1),
  -- PO-2026-008: Manila Flavor rest
  ('PO-2026-008', 6, 100, 86.00, '2026-09-02', 15, true, 3, 1, 1),
  ('PO-2026-008', 7, 80, 92.00, '2026-09-06', 15, true, 4, 1, 1),
  ('PO-2026-008', 9, 120, 68.00, '2026-09-10', 15, true, 3, 2, 3),
  -- PO-2026-009: Cebu rest
  ('PO-2026-009', 10, 30, 118.00, '2026-09-03', 30, true, 5, 1, 1),
  ('PO-2026-009', 11, 20, 93.00, '2026-09-08', 30, true, 6, 1, 1),
  ('PO-2026-009', 12, 30, 108.00, '2026-09-12', 30, true, 5, 1, 1),
  -- PO-2026-011: Metro rest
  ('PO-2026-011', 17, 60, 175.00, '2026-09-05', 45, true, 9, 1, 1),
  -- PO-2026-013: TasteBud September (partial)
  ('PO-2026-013', 1, 100, 285.00, '2026-09-02', 30, true, 1, 1, 1),
  ('PO-2026-013', 2, 70, 455.00, '2026-09-07', 30, true, 2, 1, 1),
  -- PO-2026-014: Manila Flavor September (partial)
  ('PO-2026-014', 7, 100, 94.00, '2026-09-04', 15, true, 3, 1, 1),
  ('PO-2026-014', 8, 80, 178.00, '2026-09-09', 15, true, 4, 1, 1),
  -- PO-2026-015: Cebu September
  ('PO-2026-015', 10, 45, 122.00, '2026-09-06', 30, true, 5, 1, 1),
  ('PO-2026-015', 11, 35, 96.00, '2026-09-11', 30, true, 6, 1, 1),
  -- PO-2026-016: Metro September
  ('PO-2026-016', 14, 50, 76.00, '2026-09-08', 45, true, 9, 1, 1),
  ('PO-2026-016', 15, 40, 60.00, '2026-09-13', 45, true, 10, 1, 1),
  ('PO-2026-016', 19, 20, 138.00, '2026-09-18', 45, true, 9, 1, 1),

  -- === OCTOBER 2026 (some pending deliveries) ===
  ('PO-2026-013', 5, 50, 510.00, '2026-10-01', 30, true, 1, 1, 1),
  ('PO-2026-014', 9, 100, 67.00, '2026-10-03', 15, false, 3, 1, 1);
