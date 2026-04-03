import axios from 'axios';

/**
 * Configuración de Axios para SENA RURAL HUB
 * Incluye gestión automática de Tokens y manejo de sesiones expiradas.
 */
const api = axios.create({
  // Dirección de tu servidor backend
  baseURL: 'http://localhost:4000/api',
});

// 1. INTERCEPTOR DE PETICIÓN (Request)
// Este bloque "inyecta" el token en cada llamada al backend.
// Sin esto, la base de datos rechaza las reservas por falta de usuario_id.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. INTERCEPTOR DE RESPUESTA (Response)
// Este bloque detecta si el token venció (Error 401).
// Si el profesor deja la app abierta mucho tiempo, esto lo llevará al Login suavemente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde 401 (No autorizado / Token expirado)
    if (error.response && error.response.status === 401) {
      console.warn("La sesión ha expirado o el token es inválido.");
      
      // Limpiamos el token viejo para evitar conflictos
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirigimos al Login solo si no estamos ya allí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;