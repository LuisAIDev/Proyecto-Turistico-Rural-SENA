import axios from 'axios';

// Esta configuración usará la variable VITE_API_URL cuando estemos en la nube (Render)
// y si no la encuentra (cuando estés probando en tu PC), usará el localhost.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

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
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos un 401, el usuario necesita volver a loguearse
    if (error.response && error.response.status === 401) {
      console.warn('La sesión ha expirado o el token es inválido.');

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Solo redirigir si no estamos ya en el login para evitar bucles
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
