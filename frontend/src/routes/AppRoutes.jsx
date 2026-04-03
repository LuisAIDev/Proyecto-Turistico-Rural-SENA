import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Reservas from '../pages/Reservas';
import Facturacion from '../pages/Facturacion';
import Servicios from '../pages/Servicios'; // <--- NUEVA IMPORTACIÓN PARA EL MÓDULO DE SERVICIOS
import Huespedes from '../components/Huespedes';
import PrivateRoutes from './PrivateRoutes';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de acceso público */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Bloque de Rutas Protegidas (Requieren autenticación) */}
        <Route element={<PrivateRoutes />}>
          {/* Dashboard principal */}
          <Route
            path="/"
            element={<Dashboard />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Gestión de Reservas */}
          <Route
            path="/reservas"
            element={<Reservas />}
          />

          {/* Reporte Financiero y Flujo de Caja */}
          <Route
            path="/facturacion"
            element={<Facturacion />}
          />

          {/* Gestión de Huéspedes */}
          <Route
            path="/huespedes"
            element={<Huespedes />}
          />

          {/* NUEVA RUTA: Gestión de Catálogo de Servicios */}
          <Route
            path="/servicios"
            element={<Servicios />}
          />
        </Route>

        {/* Redirección automática si el usuario intenta entrar a una ruta inexistente */}
        <Route
          path="*"
          element={<Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
