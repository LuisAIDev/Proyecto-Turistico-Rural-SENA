import './index.css';
import AppRouter from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Cambiamos bg-gray-50 por bg-[#F3E5D8] para que coincida con el estilo rural.
          Añadimos antialiased para que las fuentes se vean más finas y profesionales.
      */}
      <div className="min-h-screen bg-[#F3E5D8] antialiased text-gray-900">
        <AppRouter />
      </div>
    </AuthProvider>
  );
}
export default App;
