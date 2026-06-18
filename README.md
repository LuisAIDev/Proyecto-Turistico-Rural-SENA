# SENA Rural Hub

Full-stack web platform for rural hospitality management. SENA Rural Hub helps rural lodging operators centralize property administration, guest records, reservations, additional services, billing indicators, and public booking requests in one application.

## Live Demo

- Frontend: https://proyecto-turistico-rural-sena-1.onrender.com
- Backend API: https://proyecto-turistico-rural-sena.onrender.com
- Public catalog endpoint: https://proyecto-turistico-rural-sena.onrender.com/api/public/alojamientos

> Render free instances can take a few seconds to wake up after inactivity.

## Product Vision

Many rural lodging businesses manage availability, reservations, guests, and income with manual processes or disconnected tools. This project provides a data-driven web platform that supports both public customer interactions and internal administrative operations.

## Key Features

- Public landing page for customers.
- Public lodging catalog with availability status.
- Public reservation request form.
- JWT authentication for the administrative panel.
- Role-based access control for administrators.
- CRUD management for rural lodgings.
- Guest management.
- Reservation engine with date-overlap validation.
- Automatic calculation of nights and total payment.
- Additional services catalog.
- Dashboard with operational and financial indicators.
- Billing/reporting module.
- PostgreSQL relational database with seed data.

## Tech Stack

### Frontend

- React
- Vite
- TailwindCSS
- React Router
- Axios
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- Argon2
- Bcrypt compatibility for legacy password hashes
- CORS

### Deployment

- Render Static Site for the frontend
- Render Web Service for the backend
- Neon PostgreSQL for the production database

## Architecture

```text
Customer / Admin
       |
       v
Frontend (React SPA)
       |
       v
Backend (Express REST API)
       |
       v
PostgreSQL (Neon or local)
```

## Project Structure

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

### 1. Clone the Repository

```bash
git clone https://github.com/LuisAIDev/Proyecto-Turistico-Rural-SENA.git
cd Proyecto-Turistico-Rural-SENA
```

### 2. Create the Database

```sql
CREATE DATABASE sena_rural_hub;
```

Run the schema and seed data:

```bash
psql -U postgres -d sena_rural_hub -f database/schema.sql
```

### 3. Configure and Run the Backend

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
DB_SSL=false
JWT_SECRET=replace_with_a_strong_secret
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

Local API:

```text
http://localhost:4000/api
```

### 4. Configure and Run the Frontend

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

Local app:

```text
http://localhost:5173
```

## Production Environment Variables

### Backend

When using Neon or another hosted PostgreSQL provider, the backend can use either `DATABASE_URL` or separate database variables.

Recommended production configuration:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace_with_a_strong_secret
FRONTEND_URL=https://proyecto-turistico-rural-sena-1.onrender.com,http://localhost:5173
```

### Frontend

```env
VITE_API_URL=https://proyecto-turistico-rural-sena.onrender.com/api
```

## Demo Credentials

The seed creates an administrator user:

```text
Email: admin@sena-rural.test
Password: Admin123!
Role: admin
```

## Main Routes

### Public Routes

```http
GET  /api/public/alojamientos
POST /api/public/reservas
```

### Administrative Routes

```http
POST   /api/usuarios/login
GET    /api/usuarios
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id

GET    /api/fincas
POST   /api/fincas
PUT    /api/fincas/:id
DELETE /api/fincas/:id

GET    /api/reservas
POST   /api/reservas
PUT    /api/reservas/:id/:accion
DELETE /api/reservas/:id

GET    /api/huespedes
POST   /api/huespedes
PUT    /api/huespedes/:id
DELETE /api/huespedes/:id

GET    /api/servicios
POST   /api/servicios
DELETE /api/servicios/:id
```

See [backend/README.md](backend/README.md) for more backend details.

## Security Notes

- `.env` files are ignored by Git.
- Use `.env.example` files as templates.
- Passwords are stored with Argon2.
- Legacy Bcrypt hashes are supported during login.
- Protected routes use JWT authentication.
- Administrative actions are guarded by role middleware.
- Production CORS is configured through `FRONTEND_URL`.

## Roadmap

- Add automated backend tests.
- Add request validation middleware.
- Add image upload for lodging galleries.
- Add online payment integration.
- Add password recovery by email.
- Add Docker Compose for local development.
- Add CI/CD with GitHub Actions.
- Add screenshots and a complete production deployment guide.

## Author

Luis Orlando Guerra Gonzalez  
Software Developer in Training  
Cartagena, Colombia
