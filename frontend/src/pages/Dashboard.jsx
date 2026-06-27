import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FincaTopCard from '../components/FincaTopCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  Home, // <-- Icono de Home agregado para Fincas
  Calendar,
  Users,
  LogOut,
  Plus,
  MapPin,
  BadgeDollarSign,
  CheckCircle2,
  MousePointer2,
  // Iconos dinámicos para servicios
  Wifi,
  Waves,
  Snowflake,
  Flame,
  Bath,
  Utensils,
} from 'lucide-react';

/**
 * MAPA DE ICONOS DINÁMICOS
 */
const ICON_MAP = {
  wifi: <Wifi size={10} />,
  pool: <Waves size={10} />,
  ac_unit: <Snowflake size={10} />,
  local_fire_department: <Flame size={10} />,
  hot_tub: <Bath size={10} />,
  restaurant: <Utensils size={10} />,
};

function Dashboard() {
  // 1️⃣ Extraemos el usuario para conocer su rol
  const { logout, usuario } = useAuth();
  const [fincas, setFincas] = useState([]);
  const [todosLosServicios, setTodosLosServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalReservas: 0,
    datosGrafica: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaFinca, setNuevaFinca] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    precio_noche: '',
    servicios_ids: [], // Array de IDs seleccionados
  });

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [resFincas, resReservas, resServicios] = await Promise.all([
        api.get('/fincas'),
        api.get('/reservas'),
        api.get('/servicios'), // Endpoint para traer el catálogo de servicios
      ]);

      // 2️⃣ Adaptamos la respuesta al nuevo estándar del backend (data.data)
      setFincas(resFincas.data.data || resFincas.data);
      setTodosLosServicios(resServicios.data.data || resServicios.data);

      const reservas = resReservas.data?.data || (Array.isArray(resReservas.data) ? resReservas.data : []);
      const totalReservas = resReservas.data?.paginacion?.total ?? reservas.length;
      let ingresosAcumulados = 0;
      const resumenPorDia = {};

      reservas.forEach((r) => {
        const estadoNormalizado = r.estado ? r.estado.toLowerCase().trim() : '';
        if (estadoNormalizado === 'confirmada') {
          const monto = parseFloat(r.total || r.total_pago || 0);
          ingresosAcumulados += monto;
          const fechaLabel = new Date(r.fecha_entrada).toLocaleDateString();
          resumenPorDia[fechaLabel] = (resumenPorDia[fechaLabel] || 0) + monto;
        }
      });

      const datosGrafica = Object.keys(resumenPorDia)
        .map((fecha) => ({
          fecha,
          ganancia: resumenPorDia[fecha],
        }))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .slice(-7);

      setStats({
        totalIngresos: ingresosAcumulados,
        totalReservas,
        datosGrafica,
      });
    } catch (error) {
      console.error('Error al cargar datos del Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const prepararEdicion = (finca) => {
    setEditandoId(finca.id);
    setNuevaFinca({
      nombre: finca.nombre,
      ubicacion: finca.ubicacion,
      capacidad: finca.capacidad,
      precio_noche: finca.precio_noche,
      servicios_ids: finca.servicios ? finca.servicios.map((s) => s.id) : [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditandoId(null);
    setNuevaFinca({
      nombre: '',
      ubicacion: '',
      capacidad: '',
      precio_noche: '',
      servicios_ids: [],
    });
  };

  const toggleServicio = (id) => {
    setNuevaFinca((prev) => {
      const exists = prev.servicios_ids.includes(id);
      if (exists) {
        return {
          ...prev,
          servicios_ids: prev.servicios_ids.filter((sid) => sid !== id),
        };
      } else {
        return { ...prev, servicios_ids: [...prev.servicios_ids, id] };
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta finca?')) {
      try {
        await api.delete(`/fincas/${id}`);
        cargarTodo();
      } catch (error) {
        alert(error.response?.data?.error || 'No se pudo eliminar la finca');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const datosEnvio = {
        ...nuevaFinca,
        capacidad: parseInt(nuevaFinca.capacidad),
        precio_noche: parseFloat(nuevaFinca.precio_noche),
      };
      if (editandoId) {
        await api.put(`/fincas/${editandoId}`, datosEnvio);
      } else {
        await api.post('/fincas', datosEnvio);
      }
      handleCloseModal();
      cargarTodo();
    } catch (error) {
      alert('Error al guardar la finca');
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3E5D8]">
        <div className="text-center font-bold text-green-800 animate-pulse text-xl uppercase tracking-tighter">
          Sincronizando Ecosistema SENA RURAL...
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#F3E5D8]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#14532D] text-white flex flex-col shadow-xl sticky top-0 h-screen transition-all">
        <div className="p-6 text-2xl font-black border-b border-green-700 italic">
          SENA <span className="text-green-400">RURAL</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-3 bg-green-800 rounded-xl font-bold shadow-lg text-green-100">
            <LayoutDashboard
              size={20}
              className="text-green-400"
            />{' '}
            Dashboard
          </Link>

          {/* Módulo de Fincas Agregado Aquí */}
          <Link
            to="/fincas"
            className="flex items-center gap-3 p-3 hover:bg-green-700 rounded-xl transition-all font-bold text-green-100">
            <Home size={20} /> Fincas
          </Link>

          <Link
            to="/reservas"
            className="flex items-center gap-3 p-3 hover:bg-green-700 rounded-xl transition-all font-bold text-green-100">
            <Calendar size={20} /> Reservas
          </Link>
          <Link
            to="/huespedes"
            className="flex items-center gap-3 p-3 hover:bg-green-700 rounded-xl transition-all font-bold text-green-100">
            <Users size={20} /> Huéspedes
          </Link>
          <Link
            to="/servicios"
            className="flex items-center gap-3 p-3 hover:bg-green-700 rounded-xl transition-all font-bold text-green-100 italic">
            <MousePointer2
              size={20}
              className="text-green-400"
            />{' '}
            Otros Servicios
          </Link>
          <Link
            to="/facturacion"
            className="flex items-center gap-3 p-3 hover:bg-green-700 rounded-xl transition-all font-bold text-green-100">
            <BadgeDollarSign size={20} /> Facturación
          </Link>
        </nav>
        <div className="p-4 border-t border-green-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 text-red-300 font-bold hover:bg-red-900/20 rounded-xl transition-all">
            <LogOut size={20} /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center px-8 sticky top-0 z-10">
          <h2 className="text-xl font-black text-gray-700 uppercase italic tracking-tighter">
            Panel <span className="text-green-700">Administrativo</span>
          </h2>
          <div className="flex items-center gap-4">
            {/* Si quieres, también podrías cambiar la inicial dinámica aquí, pero dejaremos el diseño intacto */}
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Cartagena, CO
            </span>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
              {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'L'}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <FincaTopCard />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border-l-[10px] border-green-600">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Recaudado Total
              </p>
              <p className="text-4xl font-black text-gray-800 tracking-tighter">
                ${new Intl.NumberFormat('es-CO').format(stats.totalIngresos)}
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border-l-[10px] border-blue-600">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Volumen Reservas
              </p>
              <p className="text-4xl font-black text-gray-800 tracking-tighter">
                {stats.totalReservas}{' '}
                <span className="text-sm font-bold text-gray-300 uppercase italic">
                  Efectivas
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">
              Tendencia Semanal
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <BarChart data={stats.datosGrafica}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="fecha"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '15px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(val) => [
                      `$${new Intl.NumberFormat('es-CO').format(val)}`,
                      'Ingreso',
                    ]}
                  />
                  <Bar
                    dataKey="ganancia"
                    radius={[10, 10, 0, 0]}
                    barSize={40}>
                    {stats.datosGrafica.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? '#14532D' : '#22C55E'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">
                  Inventario Rural
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Gestión de Alojamientos y Servicios
                </p>
              </div>

              {/* 3️⃣ Renderizado Condicional: Solo el Admin ve el botón de Nueva Finca */}
              {usuario?.rol === 'admin' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-green-700 text-white px-8 py-3 rounded-2xl font-black hover:bg-green-800 shadow-xl transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Plus size={18} /> Nueva Finca
                </button>
              )}
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-6 py-4">Propiedad</th>
                    <th className="px-6 py-4">Comodidades</th>
                    <th className="px-6 py-4">Tarifa</th>
                    {/* Renderizado Condicional: Columna de Gestión solo para Admin */}
                    {usuario?.rol === 'admin' && (
                      <th className="px-6 py-4 text-center">Gestión</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fincas.map((finca) => (
                    <tr
                      key={finca.id}
                      className="hover:bg-green-50/50 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="font-black text-gray-800 uppercase text-sm">
                          {finca.nombre}
                        </div>
                        <div className="text-gray-400 text-[10px] flex items-center gap-1 uppercase tracking-tighter">
                          <MapPin
                            size={10}
                            className="text-green-600"
                          />{' '}
                          {finca.ubicacion}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-1">
                          {finca.servicios && finca.servicios.length > 0 ? (
                            finca.servicios.map((s) => (
                              <span
                                key={s.id}
                                className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                {ICON_MAP[s.icono] || <CheckCircle2 size={8} />}{' '}
                                {s.nombre}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-gray-300 italic uppercase">
                              Sin servicios
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black text-green-700">
                        $
                        {new Intl.NumberFormat('es-CO').format(
                          finca.precio_noche || 0,
                        )}
                      </td>

                      {/* 4️⃣ Renderizado Condicional: Botones de Editar/Eliminar solo para Admin */}
                      {usuario?.rol === 'admin' && (
                        <td className="px-6 py-6 text-center space-x-4">
                          <button
                            onClick={() => prepararEdicion(finca)}
                            className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-800">
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(finca.id)}
                            className="text-red-400 font-black text-[10px] uppercase tracking-widest hover:text-red-600">
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal con Módulo de Servicios Integrado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-white my-8">
            <h3 className="text-2xl font-black mb-6 text-gray-800 uppercase italic tracking-tighter">
              {editandoId ? 'Actualizar Propiedad' : 'Registrar Propiedad'}
            </h3>
            <form
              onSubmit={handleSave}
              className="space-y-4">
              <InputField
                label="Nombre de la Finca"
                value={nuevaFinca.nombre}
                onChange={(val) =>
                  setNuevaFinca({ ...nuevaFinca, nombre: val })
                }
              />
              <InputField
                label="Ubicación"
                value={nuevaFinca.ubicacion}
                onChange={(val) =>
                  setNuevaFinca({ ...nuevaFinca, ubicacion: val })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Capacidad"
                  type="number"
                  value={nuevaFinca.capacidad}
                  onChange={(val) =>
                    setNuevaFinca({ ...nuevaFinca, capacidad: val })
                  }
                />
                <InputField
                  label="Precio / Noche"
                  type="number"
                  value={nuevaFinca.precio_noche}
                  onChange={(val) =>
                    setNuevaFinca({ ...nuevaFinca, precio_noche: val })
                  }
                />
              </div>

              {/* Módulo de selección de servicios */}
              <div className="py-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">
                  Servicios Incluidos
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100">
                  {todosLosServicios.map((servicio) => (
                    <label
                      key={servicio.id}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-green-100">
                      <input
                        type="checkbox"
                        className="rounded text-green-600 focus:ring-green-500"
                        checked={nuevaFinca.servicios_ids.includes(servicio.id)}
                        onChange={() => toggleServicio(servicio.id)}
                      />
                      <span className="text-[10px] font-bold text-gray-600 uppercase flex items-center gap-1">
                        {ICON_MAP[servicio.icono]} {servicio.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-700 text-white py-4 font-black rounded-2xl shadow-xl hover:bg-green-800 uppercase text-[10px] tracking-widest">
                  {editandoId ? 'Guardar Cambios' : 'Crear Finca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const InputField = ({ label, type = 'text', value, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
      {label}
    </label>
    <input
      type={type}
      required
      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700 transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default Dashboard;
