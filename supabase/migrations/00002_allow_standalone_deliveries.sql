-- SakuraRecords — Allow standalone deliveries (decouple from purchase orders)

-- 1. Make poid nullable (FK still enforces referential integrity)
ALTER TABLE delivery ALTER COLUMN poid DROP NOT NULL;

-- 2. Wrap trigger logic in a Postgres function for link_delivery_to_po
CREATE OR REPLACE FUNCTION public.link_delivery_to_po(
  p_delivery_id INTEGER,
  p_poid VARCHAR
) RETURNS VOID
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_productid INTEGER;
  v_shipped NUMERIC;
  v_unit_price NUMERIC;
BEGIN
  -- Lock delivery row; fetch its product, qty, price
  SELECT productid, shipped_quantity, unit_price
  INTO v_productid, v_shipped, v_unit_price
  FROM delivery
  WHERE id = p_delivery_id
    AND deleted_at IS NULL
  FOR UPDATE;   -- blocks concurrent updates to this row

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery % not found or deleted', p_delivery_id;
  END IF;

  -- Auto-seed po_product if product not on this PO
  -- ON CONFLICT DO NOTHING handles race conditions (concurrent inserts)
  INSERT INTO po_product (poid, productid, ordered_quantity, price_per_kg)
  VALUES (p_poid, v_productid, v_shipped, v_unit_price)
  ON CONFLICT (poid, productid) DO NOTHING;

  -- Update delivery.poid → trigger validates shipped ≤ ordered
  UPDATE delivery
  SET poid = p_poid,
      updated_at = now()
  WHERE id = p_delivery_id;
END;
$function$;

-- 3. Update trigger to skip validation for standalone deliveries
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
  IF NEW.poid IS NULL THEN
    RETURN NEW;
  END IF;

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
    AND d.delivered = true
    AND d.id != COALESCE(NEW.id, -1);

  new_shipped := already_shipped + NEW.shipped_quantity;

  IF new_shipped > ordered THEN
    RAISE EXCEPTION 'Shipped quantity (%) exceeds ordered quantity (%) for product % on PO %. Already shipped: %',
      new_shipped, ordered, NEW.productid, NEW.poid, already_shipped;
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. Recreate trigger (CREATE TRIGGER has no OR REPLACE; must drop first)
DROP TRIGGER IF EXISTS check_delivery_quantity ON delivery;

CREATE TRIGGER check_delivery_quantity
  BEFORE INSERT OR UPDATE ON delivery
  FOR EACH ROW
  EXECUTE FUNCTION validate_delivery_quantity();

-- 5. Index for filtering standalone vs linked
CREATE INDEX IF NOT EXISTS idx_delivery_poid ON delivery(poid) WHERE poid IS NOT NULL;

-- 6. Grant RPC execute to authenticated role
GRANT EXECUTE ON FUNCTION public.link_delivery_to_po(INTEGER, VARCHAR) TO authenticated;
