-- SakuraRecords — Add clientid to delivery table (decouple client linkage from PO)
-- ADR-0007 established optional poid; this adds a direct clientid FK so
-- deliveries are self-contained for reporting even without a PO.

ALTER TABLE delivery
  ADD COLUMN IF NOT EXISTS clientid INTEGER
    REFERENCES client(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_delivery_clientid
  ON delivery(clientid)
  WHERE clientid IS NOT NULL;
