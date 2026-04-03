import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PrivateRoutes() {
  // 1. Extraemos también 'loading' (o 'cargando') de tu Contexto
  const { user, loading } = useContext(AuthContext);

  // 2. Si el sistema aún está verificando el token, mostramos una pantalla de espera
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  // 3. Una vez que terminó de cargar, decidimos: ¿hay usuario o al login?
  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoutes;