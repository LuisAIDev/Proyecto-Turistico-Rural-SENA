ALTER TABLE alojamientos
ADD COLUMN IF NOT EXISTS descuento INTEGER NOT NULL DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100);
