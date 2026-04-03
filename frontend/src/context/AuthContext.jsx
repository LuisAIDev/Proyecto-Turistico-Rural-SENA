import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// 1. Creamos el contexto para la autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // PERSISTENCIA: Verifica si hay un token y usuario guardados al recargar la página
  useEffect(() => {
    const verificarSesion = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Recuperamos los datos del usuario de forma segura
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('❌ Error al recuperar la sesión:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    verificarSesion();
  }, []);

  // Lógica de inicio de sesión conectada al Backend (ADSO)
  const login = async (datosFormulario) => {
    try {
      // La ruta configurada en tu backend es /usuarios/login
      const res = await api.post('/usuarios/login', datosFormulario);

      // Guardamos el token y los datos del usuario en el navegador (Persistencia de 30 días)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Actualizamos el estado global
      setUser(res.data.user);

      // ✅ IMPORTANTE: Retornamos true para que el componente Login.jsx 
      // use navigate('/dashboard') y la transición sea suave.
      return true;
    } catch (error) {
      console.error(
        '❌ Error en login:',
        error.response?.data?.error || error.message
      );
      return false;
    }
  };

  // Lógica de cierre de sesión para limpiar el rastro del usuario
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Redirigimos al login al cerrar sesión
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {/* Renderizamos los hijos siempre, pero PrivateRoutes usará 'loading' 
          para mostrar el spinner de espera.
      */}
      {children}
    </AuthContext.Provider>
  );
};

// 🌟 HOOK PERSONALIZADO: Simplifica el uso del contexto en otros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};