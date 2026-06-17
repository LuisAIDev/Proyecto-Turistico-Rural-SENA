# SENA Rural Hub

Smart SaaS platform for rural hospitality management.

SENA Rural Hub digitaliza la administracion de alojamientos rurales mediante gestion de fincas, reservas, huespedes, servicios adicionales, autenticacion por roles y dashboard con indicadores operativos.

## Product Vision

Muchas fincas rurales gestionan reservas, disponibilidad e ingresos de forma manual o con herramientas separadas. Este proyecto centraliza la operacion en una plataforma web full-stack orientada a datos.

## Core Features

- Autenticacion con JWT.
- Control de roles para administradores.
- CRUD de alojamientos rurales.
- Gestion de huespedes.
- Motor de reservas con validacion de fechas cruzadas.
- Calculo automatico de noches e ingresos.
- Catalogo de servicios adicionales.
- Dashboard con metricas y visualizacion de datos.
- Exportacion de reportes en PDF.

## Tech Stack

### Frontend

- React
- Vite
- TailwindCSS
- Recharts
- Axios
- React Router

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- Argon2

### Database

- PostgreSQL
- Modelo relacional normalizado
- Integridad referencial
- Consultas agregadas para indicadores

## Architecture

```text
Frontend (React SPA)
        |
        v
Backend (Express REST API)
        |
        v
PostgreSQL
```

Project structure:

```text
.
├── backend/
│   ├── src/config/
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── src/models/
│   ├── src/routes/
│   └── server.js
├── database/
│   └── schema.sql
├── frontend/
│   └── src/
└── README.md
```

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/LuisAIDev/Proyecto-Turistico-Rural-SENA.git
cd Proyecto-Turistico-Rural-SENA
```

### 2. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE sena_rural_hub;
```

Run the schema and demo seed:

```bash
psql -U postgres -d sena_rural_hub -f database/schema.sql
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sena_rural_hub
DB_PORT=5432
JWT_SECRET=replace_with_a_strong_secret
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

API:

```text
http://localhost:4000/api
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Optional: create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:4000/api
```

Run the frontend:

```bash
npm run dev
```

App:

```text
http://localhost:5173
```

## Demo Credentials

The SQL seed creates an admin user:

```text
Email: admin@sena-rural.test
Password: Admin123!
Role: admin
```

## API Modules

- `/api/usuarios`
- `/api/fincas`
- `/api/reservas`
- `/api/huespedes`
- `/api/servicios`

See [backend/README.md](backend/README.md) for endpoint details.

## Security Notes

- `.env` files are ignored by Git.
- Use `.env.example` files as templates.
- Passwords are hashed with Argon2.
- Protected routes use JWT authentication.
- Admin actions are guarded by role middleware.

## Roadmap

- Add automated backend tests.
- Add request validation middleware.
- Add Docker Compose for PostgreSQL, backend and frontend.
- Add production deployment guide.
- Add CI/CD with GitHub Actions.
- Add screenshots and live demo link.

## Author

Luis Orlando Guerra Gonzalez  
Software Developer in Training  
Cartagena, Colombia
