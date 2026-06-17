# SENA Rural Hub API

Backend REST para la plataforma SENA Rural Hub, una aplicacion de gestion de alojamientos rurales con autenticacion, roles, reservas, huespedes, servicios y metricas operativas.

## Stack

- Node.js
- Express
- PostgreSQL
- JWT
- Argon2
- CORS

## Modulos

- Usuarios y autenticacion
- Control de roles para administradores
- Gestion de alojamientos rurales
- Gestion de huespedes
- Motor de reservas con validacion de cruces de fechas
- Catalogo de servicios adicionales
- Estadisticas para dashboard

## Configuracion

1. Instalar dependencias:

```bash
npm install
```

2. Crear un archivo `.env` dentro de `backend/` usando `backend/.env.example` como referencia:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sena_rural_hub
DB_PORT=5432
JWT_SECRET=replace_with_a_strong_secret
FRONTEND_URL=http://localhost:5173
```

3. Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE sena_rural_hub;
```

4. Ejecutar el schema:

```bash
psql -U postgres -d sena_rural_hub -f ../database/schema.sql
```

5. Iniciar el servidor:

```bash
npm run dev
```

Servidor local:

```text
http://localhost:4000
```

## Usuario Demo

El archivo `database/schema.sql` crea un usuario administrador para pruebas:

```text
Email: admin@sena-rural.test
Password: Admin123!
Rol: admin
```

## Endpoints

### Auth y Usuarios

```http
POST   /api/usuarios/login
GET    /api/usuarios
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

Las rutas de administracion de usuarios requieren JWT y rol `admin`.

### Fincas / Alojamientos

```http
GET    /api/fincas
POST   /api/fincas
PUT    /api/fincas/:id
DELETE /api/fincas/:id
```

Crear, actualizar y eliminar alojamientos requiere rol `admin`.

### Reservas

```http
GET    /api/reservas
POST   /api/reservas
PUT    /api/reservas/:id/:accion
DELETE /api/reservas/:id
```

Acciones validas para estado:

```text
confirmar
cancelar
```

### Huespedes

```http
GET    /api/huespedes
POST   /api/huespedes
PUT    /api/huespedes/:id
DELETE /api/huespedes/:id
```

### Servicios

```http
GET    /api/servicios
POST   /api/servicios
DELETE /api/servicios/:id
```

## Seguridad

- Las contrasenas se almacenan con Argon2.
- La autenticacion usa JWT.
- Las rutas sensibles usan middleware de token y roles.
- Los secretos deben vivir en `.env`, nunca en Git.

## Notas de arquitectura

El backend sigue una separacion simple por capas:

```text
routes -> controllers -> database
```

Para una siguiente version, el proyecto podria separar reglas de negocio en servicios, agregar validacion de requests y cubrir los casos principales con pruebas automatizadas.
