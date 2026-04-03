import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut, 
  BadgeDollarSign,
  TrendingUp 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();

  // Definimos los items del menú, incluyendo Facturación
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    { 
      name: 'Reservas', 
      path: '/reservas', 
      icon: <Calendar size={20} /> 
    },
    { 
      name: 'Huéspedes', 
      path: '/huespedes', 
      icon: <Users size={20} /> 
    },
    { 
      name: 'Facturación', // El nuevo enlace para tu flujo de caja
      path: '/facturacion', 
      icon: <BadgeDollarSign size={20} /> 
    },
  ];

  return (
    <aside className="w-64 bg-[#14532D] text-white min-h-screen p-4 flex flex-col shadow-xl fixed left-0 top-0">
      {/* Logo y Título */}
      <div className="mb-10 px-4 pt-4">
        <h1 className="text-2xl font-black tracking-tighter text-white">
          SENA <span className="text-green-400">RURAL</span>
        </h1>
        <div className="h-1 w-12 bg-green-500 mt-1 rounded-full"></div>
        <p className="text-[10px] text-green-300/50 font-bold mt-2 uppercase tracking-[0.2em]">Administrador</p>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-green-700 text-white shadow-md border-l-4 border-green-400'
                  : 'text-green-100 hover:bg-green-800 hover:pl-6'
              }`}>
              <span
                className={`${isActive ? 'text-green-400' : 'text-green-300 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm uppercase tracking-wider">
                {item.name}
              </span>
              {item.name === 'Facturación' && (
                <TrendingUp size={14} className="ml-auto text-green-400 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Botón de Cerrar Sesión al final */}
      <div className="pt-6 border-t border-green-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-300 font-bold text-sm hover:bg-red-900/30 rounded-xl transition-all group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>CERRAR SESIÓN</span>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;