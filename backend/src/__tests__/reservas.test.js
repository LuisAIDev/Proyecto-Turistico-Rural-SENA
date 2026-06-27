import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../app.js'
import pool from '../config/db.js'

const TEST_SECRET = 'test-jwt-secret-sena'

const generateToken = (overrides = {}) =>
  jwt.sign(
    { id: 9999, email: 'test@sena.test', rol: 'admin', ...overrides },
    TEST_SECRET,
    { expiresIn: '1h' },
  )

const futureDate = (daysFromNow) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

let token
let testAlojamientoId
let testHuespedId
let testUserId
let reservasCreadas = []
let huespedesCreados = []

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET
  token = generateToken()

  const aloj = await pool.query(
    "SELECT id, nombre FROM alojamientos WHERE estado = 'disponible' LIMIT 1",
  )
  testAlojamientoId = aloj.rows[0]?.id
  if (!testAlojamientoId) {
    throw new Error(
      'No hay alojamientos disponibles. Ejecuta database/schema.sql primero.',
    )
  }

  const user = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['__test__user', `__test__user__${Date.now()}@sena.test`, 'dummy', 'admin'],
  )
  testUserId = user.rows[0].id
  token = generateToken({ id: testUserId })

  const huesped = await pool.query(
    `INSERT INTO huespedes (nombre, email, telefono, documento)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      '__test__huesped',
      `__test__huesped__${Date.now()}@sena.test`,
      '3000000000',
      `__test__${Date.now()}`,
    ],
  )
  testHuespedId = huesped.rows[0].id
  huespedesCreados.push(testHuespedId)
})

afterAll(async () => {
  for (const id of reservasCreadas) {
    try { await pool.query('DELETE FROM reservas WHERE id = $1', [id]) } catch { }
  }
  for (const id of huespedesCreados) {
    try { await pool.query('DELETE FROM huespedes WHERE id = $1', [id]) } catch { }
  }
  if (testUserId) {
    try { await pool.query('DELETE FROM usuarios WHERE id = $1', [testUserId]) } catch { }
  }
  await pool.end()
})

describe('POST /api/public/reservas — ruta pública (sin auth)', () => {
  test('crea reserva pública exitosamente', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({
        alojamiento_id: testAlojamientoId,
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
        telefono: '3001234567',
        documento: `__test__${Date.now()}`,
        fecha_entrada: futureDate(10),
        fecha_salida: futureDate(12),
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.reserva).toHaveProperty('id')
    expect(res.body.data.reserva.estado).toBe('pendiente')
    expect(res.body.data.reserva).toHaveProperty('updated_at')
    expect(res.body.data.reserva).toHaveProperty('created_at')

    reservasCreadas.push(res.body.data.reserva.id)
    huespedesCreados.push(res.body.data.huesped.id)
  }, 15000)

  test('rechaza fecha de salida <= entrada', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({
        alojamiento_id: testAlojamientoId,
        nombre: 'Test',
        telefono: '3000000000',
        fecha_entrada: futureDate(10),
        fecha_salida: futureDate(10),
      })
    expect(res.status).toBe(400)
  })

  test('rechaza campos obligatorios faltantes', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({ alojamiento_id: testAlojamientoId })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/reservas — autenticación', () => {
  test('devuelve lista paginada con token válido', async () => {
    const res = await request(app)
      .get('/api/reservas')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('paginacion')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.paginacion).toHaveProperty('pagina')
    expect(res.body.paginacion).toHaveProperty('total_paginas')
  })

  test('rechaza sin token (401)', async () => {
    const res = await request(app).get('/api/reservas')
    expect(res.status).toBe(401)
  })

  test('rechaza token inválido (401)', async () => {
    const res = await request(app)
      .get('/api/reservas')
      .set('Authorization', 'Bearer token-invalido')
    expect(res.status).toBe(401)
  })
})

describe('CRUD autenticado + verificación del trigger updated_at', () => {
  let reservaId

  test('POST /api/reservas — crea reserva autenticada', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        alojamiento_id: testAlojamientoId,
        huesped_id: testHuespedId,
        fecha_entrada: futureDate(20),
        fecha_salida: futureDate(22),
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.estado).toBe('pendiente')
    expect(res.body).toHaveProperty('updated_at')
    expect(res.body).toHaveProperty('created_at')

    reservaId = res.body.id
    reservasCreadas.push(reservaId)
  }, 15000)

  test('PUT /api/reservas/:id/confirmar — dispara el trigger updated_at', async () => {
    const antes = await pool.query(
      'SELECT created_at, updated_at FROM reservas WHERE id = $1',
      [reservaId],
    )
    const updatedAntes = antes.rows[0].updated_at

    const res = await request(app)
      .put(`/api/reservas/${reservaId}/confirmar`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.estado).toBe('confirmada')

    const despues = await pool.query(
      'SELECT updated_at, created_at FROM reservas WHERE id = $1',
      [reservaId],
    )
    const updatedDespues = despues.rows[0].updated_at

    expect(new Date(updatedDespues).getTime()).toBeGreaterThan(
      new Date(updatedAntes).getTime(),
    )
  }, 15000)

  test('PUT /api/reservas/:id/cancelar — actualiza updated_at de nuevo', async () => {
    const antes = await pool.query(
      'SELECT updated_at FROM reservas WHERE id = $1',
      [reservaId],
    )
    const updatedAntes = antes.rows[0].updated_at

    const res = await request(app)
      .put(`/api/reservas/${reservaId}/cancelar`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.estado).toBe('cancelada')

    const despues = await pool.query(
      'SELECT updated_at FROM reservas WHERE id = $1',
      [reservaId],
    )
    const updatedDespues = despues.rows[0].updated_at

    expect(new Date(updatedDespues).getTime()).toBeGreaterThan(
      new Date(updatedAntes).getTime(),
    )
  }, 15000)

  test('rechaza confirmar una reserva ya cancelada', async () => {
    const res = await request(app)
      .put(`/api/reservas/${reservaId}/confirmar`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  }, 15000)

  test('DELETE /api/reservas/:id — elimina la reserva', async () => {
    const res = await request(app)
      .delete(`/api/reservas/${reservaId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Reserva eliminada correctamente')

    reservasCreadas = reservasCreadas.filter((id) => id !== reservaId)
  }, 15000)
})

describe('GET /api/reservas/kpi/rentabilidad', () => {
  test('devuelve el alojamiento con mayores ingresos', async () => {
    const res = await request(app)
      .get('/api/reservas/kpi/rentabilidad')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('finca')
    expect(res.body).toHaveProperty('total_generado')
  })
})
