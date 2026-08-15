-- SakuraRecords — PostgreSQL Schema
-- Generated from live Supabase project. Run this to recreate the database.

-- =============================================================================
-- Helper Functions
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'operator');
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- =============================================================================
-- Tables
-- =============================================================================

CREATE TABLE client (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE address (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clientid INTEGER NOT NULL REFERENCES client(id),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE product (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE purchase_order (
  id VARCHAR(255) PRIMARY KEY,
  clientid INTEGER NOT NULL REFERENCES client(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE po_product (
  poid VARCHAR(255) NOT NULL REFERENCES purchase_order(id),
  productid INTEGER NOT NULL REFERENCES product(id),
  ordered_quantity NUMERIC NOT NULL CHECK (ordered_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (poid, productid)
);

CREATE TABLE transaction_document (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  document VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE delivery_requirement (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  requirement VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE delivery (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  poid VARCHAR(255) NOT NULL REFERENCES purchase_order(id),
  productid INTEGER NOT NULL REFERENCES product(id),
  shipped_quantity NUMERIC NOT NULL CHECK (shipped_quantity >= 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  delivery_date DATE NOT NULL,
  payment_terms INTEGER NOT NULL DEFAULT 30,
  paid BOOLEAN NOT NULL DEFAULT false,
  addressid INTEGER NOT NULL REFERENCES address(id),
  transactiondocumentid INTEGER NOT NULL REFERENCES transaction_document(id),
  deliveryrequirementid INTEGER NOT NULL REFERENCES delivery_requirement(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- Business Rule: Delivery quantity cannot exceed ordered quantity
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_delivery_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  ordered NUMERIC;
  already_shipped NUMERIC;
  new_shipped NUMERIC;
BEGIN
  SELECT pp.ordered_quantity INTO ordered
  FROM po_product pp
  WHERE pp.poid = NEW.poid AND pp.productid = NEW.productid;

  IF ordered IS NULL THEN
    RAISE EXCEPTION 'Product % is not on PO %', NEW.productid, NEW.poid;
  END IF;

  SELECT COALESCE(SUM(d.shipped_quantity), 0) INTO already_shipped
  FROM delivery d
  WHERE d.poid = NEW.poid
    AND d.productid = NEW.productid
    AND d.deleted_at IS NULL
    AND d.id != COALESCE(NEW.id, -1);

  new_shipped := already_shipped + NEW.shipped_quantity;

  IF new_shipped > ordered THEN
    RAISE EXCEPTION 'Shipped quantity (%) exceeds ordered quantity (%) for product % on PO %. Already shipped: %',
      new_shipped, ordered, NEW.productid, NEW.poid, already_shipped;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER check_delivery_quantity
  BEFORE INSERT OR UPDATE ON delivery
  FOR EACH ROW
  EXECUTE FUNCTION validate_delivery_quantity();

-- =============================================================================
-- RLS Policies
-- =============================================================================

ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE address ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requirement ENABLE ROW LEVEL SECURITY;

-- client
CREATE POLICY client_select ON client FOR SELECT TO authenticated
  USING ((deleted_at IS NULL) OR (get_user_role() = 'admin'));
CREATE POLICY client_insert ON client FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY client_update ON client FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY client_delete ON client FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- address
CREATE POLICY address_select ON address FOR SELECT TO authenticated
  USING ((deleted_at IS NULL) OR (get_user_role() = 'admin'));
CREATE POLICY address_insert ON address FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY address_update ON address FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY address_delete ON address FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- product
CREATE POLICY product_select ON product FOR SELECT TO authenticated
  USING ((deleted_at IS NULL) OR (get_user_role() = 'admin'));
CREATE POLICY product_insert ON product FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY product_update ON product FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY product_delete ON product FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- purchase_order
CREATE POLICY purchase_order_select ON purchase_order FOR SELECT TO authenticated
  USING ((deleted_at IS NULL) OR (get_user_role() = 'admin'));
CREATE POLICY purchase_order_insert ON purchase_order FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY purchase_order_update ON purchase_order FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY purchase_order_delete ON purchase_order FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- po_product (admin-only write)
CREATE POLICY po_product_select ON po_product FOR SELECT TO authenticated USING (true);
CREATE POLICY po_product_insert ON po_product FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'admin');
CREATE POLICY po_product_update ON po_product FOR UPDATE TO authenticated
  USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY po_product_delete ON po_product FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- delivery
CREATE POLICY delivery_select ON delivery FOR SELECT TO authenticated
  USING ((deleted_at IS NULL) OR (get_user_role() = 'admin'));
CREATE POLICY delivery_insert ON delivery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY delivery_update ON delivery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY delivery_delete ON delivery FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- transaction_document
CREATE POLICY transaction_document_select ON transaction_document FOR SELECT TO authenticated
  USING ((deleted_at IS NULL) OR (get_user_role() = 'admin'));
CREATE POLICY transaction_document_insert ON transaction_document FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY transaction_document_update ON transaction_document FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY transaction_document_delete ON transaction_document FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- delivery_requirement
CREATE POLICY delivery_requirement_select ON delivery_requirement FOR SELECT TO authenticated
  USING ((deleted_at IS NULL) OR (get_user_role() = 'admin'));
CREATE POLICY delivery_requirement_insert ON delivery_requirement FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY delivery_requirement_update ON delivery_requirement FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY delivery_requirement_delete ON delivery_requirement FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- =============================================================================
-- Seed Data
-- =============================================================================

INSERT INTO transaction_document (document) VALUES
  ('Delivery Receipt and Sales Invoice'),
  ('Delivery Receipt Only'),
  ('Sales Invoice Only');

INSERT INTO delivery_requirement (requirement) VALUES
  ('Certificate of Analysis and Purchase Order'),
  ('COA Only'),
  ('PO Only');
