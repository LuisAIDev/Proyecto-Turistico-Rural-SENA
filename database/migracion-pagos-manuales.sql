CREATE TABLE IF NOT EXISTS pagos_manuales (
  id SERIAL PRIMARY KEY,
  cliente VARCHAR(200) NOT NULL,
  alojamiento_id INTEGER REFERENCES alojamientos(id) ON DELETE SET NULL,
  alojamiento_nombre VARCHAR(200),
  monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
  descripcion TEXT,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
