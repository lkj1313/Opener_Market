-- This is an empty migration.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_product_name_trgm ON "Product" USING gin (name gin_trgm_ops);