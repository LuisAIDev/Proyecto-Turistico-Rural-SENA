🌿 SENA Rural Hub
Smart SaaS Platform for Rural Hospitality Management

Transformamos la gestión del turismo rural en una operación inteligente, medible y rentable.

🚀 Product Vision

SENA Rural Hub es una plataforma SaaS diseñada para digitalizar y optimizar la administración de alojamientos rurales mediante:

Automatización de reservas
Control de disponibilidad en tiempo real
Inteligencia de ingresos
Métricas estratégicas de ocupación
Seguridad basada en roles

El objetivo es claro:
Convertir la gestión rural tradicional en una operación moderna, escalable y basada en datos.

🧠 Value Proposition

Las fincas rurales suelen operar de forma manual o con herramientas fragmentadas.

SENA Rural Hub centraliza todo en una sola plataforma:

✔ Gestión de propiedades
✔ Reservas con validación inteligente
✔ Cálculo automático de facturación
✔ Dashboard con métricas en tiempo real
✔ Exportación de reportes en PDF
✔ Control de roles (Admin / Usuario)

No es solo un sistema.
Es un panel de control financiero para turismo rural.

🏗 Architecture Overview

Arquitectura desacoplada tipo SaaS moderna:

Frontend (React SPA)
⬇
Backend (Node.js + Express API REST)
⬇
PostgreSQL (Relational Database)

Diseñada para:

Escalabilidad horizontal
Seguridad por capas
Integración futura con microservicios
⚙ Tech Stack

Frontend

React + Vite
TailwindCSS
Recharts (visualización de datos)
Context API (gestión de sesión)
Axios (cliente HTTP)

Backend

Node.js
Express
PostgreSQL
JWT Authentication
bcrypt (hash de contraseñas)

Database

Modelo relacional normalizado
Integridad referencial
Consultas agregadas optimizadas
🔐 Security Model
Autenticación basada en JWT
Hash seguro de contraseñas
Middleware de validación de token
Separación por roles (admin / usuario)
Protección de rutas privadas

Flujo seguro:

Login → Token firmado → Header Authorization → Middleware valida → Acceso permitido

📊 Business Intelligence Layer

El sistema incorpora una capa de análisis operativo con indicadores clave:

📈 Crecimiento mensual
📊 Porcentaje de ocupación
💰 Ingresos acumulados
🏆 Top 5 fincas más rentables
📅 Tendencia semanal
📄 Exportación de estadísticas en PDF

Toda la analítica se calcula desde consultas SQL agregadas para mayor eficiencia.

💼 Core Functional Modules
Property Management
CRUD completo
Configuración de precio por noche
Asociación dinámica con reservas
Reservation Engine
Validación de fechas cruzadas
Cálculo automático de noches
Cálculo automático de ingresos
Estados transaccionales:
pendiente
confirmada
cancelada
Guest Management
Registro y seguimiento
Asociación directa a reservas
Financial Overview
Dashboard dinámico
Métricas estratégicas
Reportes exportables
🧩 Project Structure

Backend

backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── server.js

Frontend

frontend/
│
├── components/
├── context/
├── pages/
├── routes/
└── services/

Arquitectura modular lista para escalar.

🖥 Local Installation Guide
1️⃣ Clone Repository
git clone https://github.com/LuisAIDev/Proyecto-Turistico-Rural-SENA.git
2️⃣ Backend Setup
cd backend
npm install

Crear archivo .env:

DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
JWT_SECRET=

Ejecutar:

npm run dev

Servidor activo en:
http://localhost:4000

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

Aplicación activa en:
http://localhost:5173

📈 Scalability Roadmap

La arquitectura permite evolución hacia:

Docker containerization
Despliegue en nube (AWS / Azure / Railway)
Cache con Redis
Separación en microservicios
Integración con pasarela de pagos
Multi-tenant SaaS
🎯 Ideal Use Case
Administradores de fincas rurales
Cooperativas turísticas
Operadores de turismo comunitario
Proyectos académicos de gestión hotelera
🧑‍💻 Author

Luis Orlando Guerra González
Software Developer in Training
Cartagena, Colombia