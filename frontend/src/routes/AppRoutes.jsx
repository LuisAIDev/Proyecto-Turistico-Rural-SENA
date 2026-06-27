import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicHome from '../pages/PublicHome';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Reservas from '../pages/Reservas';
import Facturacion from '../pages/Facturacion';
import Servicios from '../pages/Servicios'; 
import Huespedes from '../components/Huespedes';
import Fincas from '../pages/Fincas';
import Imagenes from '../pages/Imagenes';
import PrivateRoutes from './PrivateRoutes';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para clientes */}
        <Route
          path="/"
          element={<PublicHome />}
        />

        {/* Ruta de acceso administrativo */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Bloque de Rutas Protegidas (Requieren autenticación) */}
        <Route element={<PrivateRoutes />}>
          {/* Dashboard principal */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* NUEVA RUTA: Gestión independiente de Fincas / Alojamientos */}
          <Route
            path="/fincas"
            element={<Fincas />}
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

          {/* Gestión de Catálogo de Servicios */}
          <Route
            path="/servicios"
            element={<Servicios />}
          />

          {/* Gestión de Imágenes / Multimedia */}
          <Route
            path="/imagenes"
            element={<Imagenes />}
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
