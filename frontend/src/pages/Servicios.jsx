import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  CheckCircle2,
  Wifi,
  Waves,
  Snowflake,
  Flame,
  Bath,
  Utensils,
  X,
  Trash2
} from 'lucide-react';

const ICON_MAP = {
  wifi: <Wifi size={20} />,
  pool: <Waves size={20} />,
  ac_unit: <Snowflake size={20} />,
  local_fire_department: <Flame size={20} />,
  hot_tub: <Bath size={20} />,
  restaurant: <Utensils size={20} />,
};

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: '',
    icono: 'wifi',
    ref_code: '',
    precio: 0 // Añadido por si tu DB lo requiere
  });

  const cargarServicios = async () => {
    try {
      setLoading(true);
      // Intenta primero con /servicios, si falla usa /servicios-adicionales
      const res = await api.get('/servicios');
      setServicios(res.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      // Fallback por si la ruta en tu backend es diferente
      try {
        const resAlt = await api.get('/servicios-adicionales');
        setServicios(resAlt.data);
      } catch (err) {
        console.error('Error en ruta alternativa:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aseguramos que ref_code tenga un valor si está vacío
      const dataAEnviar = {
        ...nuevoServicio,
        ref_code: nuevoServicio.ref_code || `REF-${nuevoServicio.nombre.substring(0,3).toUpperCase()}`
      };

      await api.post('/servicios', dataAEnviar);
      setMostrarForm(false);
      setNuevoServicio({ nombre: '', icono: 'wifi', ref_code: '', precio: 0 });
      cargarServicios();
      alert('✅ Servicio creado correctamente');
    } catch (error) {
      console.error('Error al crear:', error);
      alert('Error al crear el servicio. Revisa la consola del navegador.');
    }
  };

  const eliminarServicio = async (id) => {
    if (window.confirm('¿Eliminar este servicio?')) {
      try {
        await api.delete(`/servicios/${id}`);
        cargarServicios();
      } catch (error) {
        alert('No se pudo eliminar el servicio');
      }
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F3E5D8] min-h-screen">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">
              Catálogo de Servicios
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Configuración Global de Comodidades
            </p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-green-700 text-white px-8 py-3 rounded-2xl font-black hover:bg-green-800 shadow-xl flex items-center gap-2 text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            <Plus size={18} /> Nuevo Servicio
          </button>
        </div>

        {mostrarForm && (
          <div className="p-10 bg-gray-50 border-b border-gray-100 animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none font-bold"
                  value={nuevoServicio.nombre}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                  placeholder="Ej: Zona de Hamacas"
                />
              </div>
              
              <div className="w-40">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                  Icono
                </label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none font-bold appearance-none bg-white"
                  value={nuevoServicio.icono}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, icono: e.target.value })}
                >
                  {Object.keys(ICON_MAP).map((key) => (
                    <option key={key} value={key}>{key.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="bg-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-gray-800 transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="bg-gray-200 text-gray-600 p-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="p-20 text-center font-black text-gray-400 uppercase animate-pulse">
            Cargando Catálogo...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10">
            {servicios.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400 font-bold">
                No hay servicios registrados. ¡Crea el primero!
              </div>
            ) : (
              servicios.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-700 rounded-2xl group-hover:bg-green-700 group-hover:text-white transition-colors">
                      {ICON_MAP[s.icono] || <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <p className="font-black text-gray-800 uppercase text-sm tracking-tight">
                        {s.nombre}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        Ref: {s.ref_code || s.icono}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => eliminarServicio(s.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Servicios;