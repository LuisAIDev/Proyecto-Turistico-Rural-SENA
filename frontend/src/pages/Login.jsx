import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. Importamos la herramienta de navegación

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // 2. Inicializamos la navegación

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const resultado = await login(form);
      if (resultado) {
        // 3. ¡ÉXITO! Si el login es correcto, enviamos al usuario al Dashboard
        navigate('/dashboard'); 
      } else {
        setError('Credenciales incorrectas. Revisa tu correo y contraseña.');
      }
    } catch (err) {
      setError(
        'No se pudo conectar con el servidor. ¿Está el backend encendido?',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-green-600">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">
            SENA <span className="text-green-600">RURAL</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Gestión de Alojamiento Profesional
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 rounded-lg text-sm font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@sena.edu.co"
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none transition-all"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={cargando}
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full ${
              cargando ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            } text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1`}
          >
            {cargando ? 'VALIDANDO DATOS...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;