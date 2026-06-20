# 🌿 SENA Rural Hub

![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Node](https://img.shields.io/badge/Backend-Node.js-339933)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7)
![Status](https://img.shields.io/badge/Status-En%20Producción-success)
![License](https://img.shields.io/badge/License-Portafolio-blue)

## 📌 Descripción General

**SENA Rural Hub** es una plataforma web **Full-Stack** diseñada para la gestión integral de operaciones de turismo rural.

La aplicación permite centralizar en un solo sistema:

- Administración de fincas y alojamientos
- Gestión de huéspedes
- Motor de reservas inteligente
- Servicios adicionales
- Facturación
- Indicadores financieros y operativos
- Solicitudes públicas de reserva

Este proyecto fue desarrollado como solución tecnológica orientada a la digitalización del sector turístico rural, buscando reemplazar procesos manuales por una plataforma moderna basada en datos.

---

# 🚀 Demo en Producción

🌐 **Frontend (Aplicación Web):**  
https://proyecto-turistico-rural-sena-1.onrender.com

⚙️ **Backend API:**  
https://proyecto-turistico-rural-sena.onrender.com

🏡 **Catálogo Público de Alojamientos:**  
https://proyecto-turistico-rural-sena.onrender.com/api/public/alojamientos

> **Nota:** Las instancias gratuitas de Render pueden tardar unos segundos en activarse después de un tiempo de inactividad.

---

## 🖼️ Galería de SENA Rural Hub

Aquí puedes visualizar el flujo de trabajo de la plataforma, desde la experiencia del usuario hasta el control administrativo.

### Vista de Usuario

|                                Pantalla Principal                                 |                           Formulario de Reserva                           |
| :-------------------------------------------------------------------------------: | :-----------------------------------------------------------------------: |
| !Vista Principal(screenshots/Captura%20de%20pantalla%202026-06-20%20120011_2.png) | ![Reserva]screenshots/Captura%20de%20pantalla%202026-06-18%20160115_2.png |

### Panel Administrativo

|                             Dashboard Principal                             |                               Inventario Rural                               |                            Gestión de Facturación                             |
| :-------------------------------------------------------------------------: | :--------------------------------------------------------------------------: | :---------------------------------------------------------------------------: |
| ![Dashboard]screenshots/Captura%20de%20pantalla%202026-06-20%20124051_3.png | ![Inventario]screenshots/Captura%20de%20pantalla%202026-06-20%20130830_3.png | ![Facturación]screenshots/Captura%20de%20pantalla%202026-06-20%20130848_3.png |

---

_Nota: Este sistema permite la gestión integral de alojamientos rurales, optimizando el control de reservas y el flujo de caja._

# 🎯 Visión del Producto

Muchos negocios de turismo rural aún gestionan reservas mediante:

- WhatsApp
- Excel
- Llamadas telefónicas
- Procesos manuales

Esto suele generar problemas como:

- Overbooking
- Pérdida de clientes
- Errores de facturación
- Mala trazabilidad
- Dificultad para medir rentabilidad

**SENA Rural Hub** nace para resolver estos problemas digitalizando procesos críticos del negocio.

Objetivos del sistema:

✅ Mejorar el control operativo  
✅ Automatizar reservas  
✅ Reducir errores humanos  
✅ Facilitar análisis financiero  
✅ Escalar el negocio rural

---

# 🧠 Problema de Negocio que Resuelve

La mayoría de pequeños operadores rurales no cuenta con herramientas de gestión modernas.

Esto afecta:

- Toma de decisiones
- Control de ocupación
- Gestión de ingresos
- Experiencia del cliente

Con esta plataforma, el negocio puede operar bajo un modelo **data-driven**, donde cada reserva y transacción genera información útil para crecer.

---

# ✨ Funcionalidades Principales

## Módulo Público

- Landing page para clientes
- Catálogo de alojamientos
- Consulta de disponibilidad
- Solicitud de reservas públicas

## Módulo Administrativo

- Login seguro
- Dashboard
- Gestión de fincas
- Gestión de huéspedes
- Gestión de reservas
- Gestión de servicios adicionales
- Facturación
- Reportes

---

# 🔥 Funcionalidades Técnicas Implementadas

- Autenticación JWT
- Persistencia de sesión
- Rutas protegidas
- Middleware de autorización por roles
- CRUD completo
- API REST
- Arquitectura modular
- Validación de solapamiento de reservas
- Cálculo automático de noches
- Cálculo automático de pagos
- Dashboard analítico
- Backend desplegado en cloud
- Base de datos relacional en producción

---

# 👥 Casos de Uso

## Cliente

Puede:

- Consultar alojamientos
- Ver disponibilidad
- Solicitar reservas

## Administrador

Puede:

- Gestionar fincas
- Crear reservas
- Confirmar o cancelar reservas
- Gestionar huéspedes
- Revisar ingresos
- Analizar ocupación
- Consultar estadísticas

---

# 🛠 Stack Tecnológico

## Frontend

- React
- Vite
- TailwindCSS
- React Router
- Axios
- Recharts
- Lucide React

## Backend

- Node.js
- Express
- PostgreSQL
- JWT
- Argon2
- Bcrypt (compatibilidad legacy)
- CORS

## Infraestructura Cloud

- Render (Frontend)
- Render Web Service (Backend)
- Neon PostgreSQL (Database Cloud)

---

# 🏗 Arquitectura del Sistema

```text
Cliente Web (React SPA)
        |
        v
API REST Segura (Node + Express)
        |
        v
Controladores / Middleware / Lógica de Negocio
        |
        v
PostgreSQL (Neon Cloud)
```

Arquitectura basada en separación por capas:

### 1. Presentación

Interfaz React para usuarios y administradores.

### 2. API REST

Endpoints seguros con Express.

### 3. Lógica de Negocio

Controladores y validaciones.

### 4. Persistencia

PostgreSQL relacional.

---

# 📂 Estructura del Proyecto

```bash
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── context/
│   │   └── services/
│
└── README.md
```

---

# ⚙ Instalación Local

## 1. Clonar repositorio

```bash
git clone https://github.com/LuisAIDev/Proyecto-Turistico-Rural-SENA.git
cd Proyecto-Turistico-Rural-SENA
```

---

## 2. Configurar Base de Datos

Crear base de datos:

```sql
CREATE DATABASE sena_rural_hub;
```

---

## 3. Backend

Entrar:

```bash
cd backend
npm install
```

Crear archivo `.env`

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=sena_rural_hub
DB_PORT=5432
JWT_SECRET=tu_clave_segura
FRONTEND_URL=http://localhost:5173
```

Ejecutar:

```bash
npm run dev
```

API local:

```bash
http://localhost:4000/api
```

---

## 4. Frontend

Entrar:

```bash
cd frontend
npm install
```

Crear `.env`

```env
VITE_API_URL=http://localhost:4000/api
```

Ejecutar:

```bash
npm run dev
```

Frontend local:

```bash
http://localhost:5173
```

---

# 🔐 Seguridad Implementada

El sistema implementa múltiples capas de seguridad:

- Hash seguro de contraseñas
- JWT Authentication
- Middleware de autorización
- Validación de roles
- Protección de rutas privadas
- CORS configurado
- Variables sensibles en `.env`

---

# 🌐 Endpoints Principales

## Públicas

```http
GET  /api/public/alojamientos
POST /api/public/reservas
```

## Usuarios

```http
POST   /api/usuarios/login
GET    /api/usuarios
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

## Fincas

```http
GET    /api/fincas
POST   /api/fincas
PUT    /api/fincas/:id
DELETE /api/fincas/:id
```

## Reservas

```http
GET    /api/reservas
POST   /api/reservas
PUT    /api/reservas/:id/:accion
DELETE /api/reservas/:id
```

## Huéspedes

```http
GET    /api/huespedes
POST   /api/huespedes
PUT    /api/huespedes/:id
DELETE /api/huespedes/:id
```

## Servicios

```http
GET    /api/servicios
POST   /api/servicios
DELETE /api/servicios/:id
```

---

# 📊 Métricas del Proyecto

### Complejidad Técnica

- Frontend SPA completo
- Backend REST API
- Persistencia cloud
- Seguridad JWT
- Arquitectura modular

### Módulos construidos

✅ Login  
✅ Dashboard  
✅ Reservas  
✅ Fincas  
✅ Servicios  
✅ Huéspedes  
✅ Facturación

---

# 🚧 Retos Técnicos Superados

Durante el desarrollo se resolvieron desafíos como:

- Comunicación frontend/backend
- Manejo de CORS en producción
- Persistencia de sesión JWT
- Debugging de errores 401
- Despliegue distribuido
- Manejo de fechas
- Prevención de reservas solapadas
- Integración con Neon PostgreSQL

---

# 📈 Roadmap

## Versión 2.0

- [ ] Exportar reportes PDF
- [ ] Dashboard avanzado con analytics
- [ ] Indicadores de ocupación
- [ ] Top 5 fincas más rentables
- [ ] Indicador de crecimiento mensual
- [ ] Carga de imágenes
- [ ] Integración con pagos online

## Versión 3.0

- [ ] Multiempresa (Multi-tenant SaaS)
- [ ] Suscripción mensual
- [ ] App móvil
- [ ] IA para predicción de ocupación

---

# 💼 Valor Profesional del Proyecto

Este proyecto representa mi transición hacia el desarrollo de software profesional.

Más allá del código, este sistema me permitió practicar:

- Pensamiento arquitectónico
- Diseño de APIs
- Modelado relacional
- Debugging real
- Cloud deployment
- Resolución de problemas complejos

---

# 👨‍💻 Autor

## Luis Orlando Guerra González

Desarrollador Full-Stack en formación  
Estudiante ADSO — SENA  
Cartagena, Colombia

GitHub:  
LuisAIDev

LinkedIn:  
www.linkedin.com/in/luis-orlando-guerra-gonzalez-49aa30244

---

# 📜 Estado del Proyecto

🟢 En producción  
🟢 Activo  
🟢 En evolución continua

---

---

# 📜 Licencia

Este proyecto está protegido bajo la licencia personalizada:

**SENA Rural Hub Community License v1.0**

## Uso permitido

Se permite usar este software gratuitamente para:

- Aprendizaje y formación académica
- Investigación tecnológica
- Proyectos sociales
- Emprendimientos rurales pequeños
- Hoteles, fincas y alojamientos de pequeña escala
- Organizaciones sin ánimo de lucro

## Restricciones

NO está permitido sin autorización expresa del autor:

- Revender este software
- Comercializar copias
- Ofrecerlo como SaaS pago
- Reempaquetarlo como producto propietario
- Eliminar créditos del autor original

## Filosofía de la Licencia

Este proyecto fue creado con una visión social:

Democratizar el acceso a tecnología para pequeños negocios rurales que normalmente no pueden costear software empresarial.

El objetivo es que la tecnología sirva para ayudar, educar y generar impacto positivo.

Para más detalles legales, consulte el archivo:

```bash
LICENSE
```

!License https://img.shields.io/badge/License-Community%20v1.0-orange

# ⭐ Nota Final

Este proyecto fue construido como parte de mi crecimiento profesional en desarrollo de software.

Representa no solo conocimientos técnicos en:

- React
- Node.js
- PostgreSQL
- Cloud Deployment

Sino también mi compromiso con construir soluciones tecnológicas reales que generen impacto.

> “El software no solo resuelve problemas; también transforma industrias.”
