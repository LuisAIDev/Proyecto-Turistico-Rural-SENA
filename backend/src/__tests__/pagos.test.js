import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import pool from '../config/db.js';

const TEST_SECRET = 'test-jwt-secret-sena';

const generateToken = (overrides = {}) =>
  jwt.sign(
    { id: 9999, email: 'test@sena.test', rol: 'admin', ...overrides },
    TEST_SECRET,
    { expiresIn: '1h' },
  );

let token;
let testUserId;
let testAlojamientoId;
let pagosCreados = [];

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  token = generateToken();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pagos_manuales (
      id SERIAL PRIMARY KEY,
      cliente VARCHAR(200) NOT NULL,
      alojamiento_id INTEGER REFERENCES alojamientos(id) ON DELETE SET NULL,
      alojamiento_nombre VARCHAR(200),
      monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
      estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','completado','cancelado')),
      descripcion TEXT,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const user = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['__test__pagos_user', `__test__pagos__${Date.now()}@sena.test`, 'dummy', 'admin'],
  );
  testUserId = user.rows[0].id;
  token = generateToken({ id: testUserId });

  const aloj = await pool.query(
    "SELECT id FROM alojamientos WHERE estado = 'disponible' LIMIT 1",
  );
  testAlojamientoId = aloj.rows[0]?.id;
  if (!testAlojamientoId) {
    throw new Error(
      'No hay alojamientos disponibles. Ejecuta database/schema.sql primero.',
    );
  }
});

afterAll(async () => {
  for (const id of pagosCreados) {
    try { await pool.query('DELETE FROM pagos_manuales WHERE id = $1', [id]); } catch { }
  }
  if (testUserId) {
    try { await pool.query('DELETE FROM usuarios WHERE id = $1', [testUserId]); } catch { }
  }
  await pool.end();
});

describe('POST /api/pagos — creación de pagos manuales', () => {
  test('crea pago completado exitosamente', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente: 'Cliente Test',
        alojamiento_id: testAlojamientoId,
        monto: 150000,
        estado: 'completado',
        descripcion: 'Pago en efectivo',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.cliente).toBe('Cliente Test');
    expect(parseFloat(res.body.monto)).toBe(150000);
    expect(res.body.estado).toBe('completado');
    expect(res.body).toHaveProperty('created_at');

    pagosCreados.push(res.body.id);
  });

  test('crea pago pendiente sin alojamiento', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente: 'Otro Cliente',
        monto: 75000,
        estado: 'pendiente',
      });

    expect(res.status).toBe(201);
    expect(res.body.cliente).toBe('Otro Cliente');
    expect(parseFloat(res.body.monto)).toBe(75000);
    expect(res.body.estado).toBe('pendiente');
    expect(res.body.alojamiento_id).toBeNull();

    pagosCreados.push(res.body.id);
  });

  test('rechaza cliente vacío', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente: '   ',
        monto: 50000,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('cliente');
  });

  test('rechaza monto cero o negativo', async () => {
    const res1 = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({ cliente: 'Test', monto: 0 });

    expect(res1.status).toBe(400);
    expect(res1.body.error).toContain('monto');

    const res2 = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({ cliente: 'Test', monto: -100 });

    expect(res2.status).toBe(400);
    expect(res2.body.error).toContain('monto');
  });

  test('rechaza monto no numérico', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({ cliente: 'Test', monto: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('monto');
  });

  test('rechaza sin token (401)', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .send({ cliente: 'Test', monto: 50000 });

    expect(res.status).toBe(401);
  });

  test('rechaza token inválido (401)', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', 'Bearer token-falso')
      .send({ cliente: 'Test', monto: 50000 });

    expect(res.status).toBe(401);
  });

  test('rechaza alojamiento inexistente', async () => {
    const res = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente: 'Test',
        alojamiento_id: 999999,
        monto: 50000,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('alojamiento');
  });
});

describe('GET /api/pagos — listar pagos', () => {
  test('devuelve lista de pagos con token válido', async () => {
    const res = await request(app)
      .get('/api/pagos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('rechaza sin token (401)', async () => {
    const res = await request(app).get('/api/pagos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/reservas/facturacion — incluye pagos manuales', () => {
  test('devuelve transacciones con resumen financiero', async () => {
    const res = await request(app)
      .get('/api/reservas/facturacion')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transacciones');
    expect(res.body).toHaveProperty('resumen');
    expect(Array.isArray(res.body.transacciones)).toBe(true);
    expect(res.body.resumen).toHaveProperty('totalRecaudado');
    expect(res.body.resumen).toHaveProperty('pagosPendientes');
    expect(res.body.resumen).toHaveProperty('transaccionesMes');

    const pagosEnRespuesta = res.body.transacciones.filter((t) => t.tipo === 'manual');
    expect(pagosEnRespuesta.length).toBeGreaterThanOrEqual(1);
    expect(pagosEnRespuesta[0]).toHaveProperty('metodo', 'Efectivo');
  });
});
