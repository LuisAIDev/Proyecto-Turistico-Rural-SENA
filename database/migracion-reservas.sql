-- ============================================================
-- MIGRACIÓN: Mejoras a la tabla reservas
-- Ejecutar en la base de datos de Neon.tech
-- ============================================================

-- 1. Agregar columna updated_at (si no existe)
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Eliminar CHECK constraint anterior si existe y crear el nuevo
ALTER TABLE reservas
  DROP CONSTRAINT IF EXISTS reservas_estado_check;

ALTER TABLE reservas
  ADD CONSTRAINT reservas_estado_check
  CHECK (estado IN ('pendiente', 'confirmada', 'cancelada'));

-- 3. Crear función y trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservas_updated_at ON reservas;

CREATE TRIGGER trg_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();
