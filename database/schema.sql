CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alojamientos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  ubicacion VARCHAR(180) NOT NULL,
  descripcion TEXT,
  capacidad INTEGER NOT NULL DEFAULT 0 CHECK (capacidad >= 0),
  precio_noche NUMERIC(12, 2) NOT NULL CHECK (precio_noche >= 0),
  estado VARCHAR(30) NOT NULL DEFAULT 'disponible',
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS huespedes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  email VARCHAR(160),
  telefono VARCHAR(40),
  documento VARCHAR(60) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servicios_adicionales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  icono VARCHAR(80) NOT NULL,
  ref_code VARCHAR(30) NOT NULL UNIQUE,
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alojamiento_servicios (
  alojamiento_id INTEGER NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
  servicio_id INTEGER NOT NULL REFERENCES servicios_adicionales(id) ON DELETE CASCADE,
  PRIMARY KEY (alojamiento_id, servicio_id)
);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  alojamiento_id INTEGER NOT NULL REFERENCES alojamientos(id) ON DELETE RESTRICT,
  huesped_id INTEGER NOT NULL REFERENCES huespedes(id) ON DELETE RESTRICT,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_entrada DATE NOT NULL,
  fecha_salida DATE NOT NULL,
  total_pago NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_pago >= 0),
  noches INTEGER NOT NULL DEFAULT 0 CHECK (noches >= 0),
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reservas_rango_fechas CHECK (fecha_salida > fecha_entrada)
);

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

CREATE INDEX IF NOT EXISTS idx_reservas_alojamiento_fechas
  ON reservas (alojamiento_id, fecha_entrada, fecha_salida);

CREATE INDEX IF NOT EXISTS idx_reservas_estado
  ON reservas (estado);

INSERT INTO usuarios (nombre, email, password, rol)
VALUES (
  'Admin Demo',
  'admin@sena-rural.test',
  '$argon2id$v=19$m=65536,t=3,p=4$nCo7topkL1vpWH4GsubxhQ$EqCLRKn+ID093gMdURNptkk9Uq1F/wgR5/inf6+yRWc',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO servicios_adicionales (nombre, icono, ref_code, precio)
VALUES
  ('Wifi', 'wifi', 'WIFI', 0),
  ('Piscina', 'pool', 'POOL', 80000),
  ('Aire acondicionado', 'ac_unit', 'AC', 50000),
  ('Zona BBQ', 'local_fire_department', 'BBQ', 60000),
  ('Jacuzzi', 'hot_tub', 'JAC', 90000),
  ('Restaurante', 'restaurant', 'REST', 0)
ON CONFLICT (ref_code) DO NOTHING;

INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id)
SELECT 'Los Delfines', 'Turbaco', 'Finca rural con piscina, zonas verdes y espacios familiares.', 25, 1000000, 'disponible', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM alojamientos
  WHERE lower(nombre) = lower('Los Delfines') AND lower(ubicacion) = lower('Turbaco')
);

INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id)
SELECT 'Los Cocos', 'Baru', 'Alojamiento cerca de la playa con ambiente tranquilo.', 25, 1000000, 'disponible', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM alojamientos
  WHERE lower(nombre) = lower('Los Cocos') AND lower(ubicacion) = lower('Baru')
);

INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id)
SELECT 'Las Islas', 'Islas del Rosario', 'Experiencia isleña para grupos y descanso frente al mar.', 30, 1500000, 'disponible', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM alojamientos
  WHERE lower(nombre) = lower('Las Islas') AND lower(ubicacion) = lower('Islas del Rosario')
);

INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id)
SELECT 'Cielo Mar', 'Baru', 'Casa campestre con vista costera y servicios para estadías completas.', 25, 1500000, 'disponible', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM alojamientos
  WHERE lower(nombre) = lower('Cielo Mar') AND lower(ubicacion) = lower('Baru')
);

INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id)
SELECT 'Mar Caribe', 'Islas del Rosario', 'Alojamiento turístico para descanso, gastronomía y actividades náuticas.', 18, 1500000, 'disponible', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM alojamientos
  WHERE lower(nombre) = lower('Mar Caribe') AND lower(ubicacion) = lower('Islas del Rosario')
);

INSERT INTO alojamientos (nombre, ubicacion, descripcion, capacidad, precio_noche, estado, usuario_id)
SELECT 'Los Calamares', 'Islas del Rosario', 'Playa privada y deportes náuticos para visitantes.', 15, 2000000, 'disponible', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM alojamientos
  WHERE lower(nombre) = lower('Los Calamares') AND lower(ubicacion) = lower('Islas del Rosario')
);
