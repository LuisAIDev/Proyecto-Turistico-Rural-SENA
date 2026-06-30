import { useState, useEffect } from 'react';
import api from '../services/api';
import { PlusCircle, CheckCircle, XCircle, Trash2, CreditCard } from 'lucide-react';
import CheckoutForm from '../components/CheckoutForm';

/**
 * ==========================================
 * COMPONENTE: GESTIÓN DE RESERVAS
 * PROYECTO: TURISMO RURAL - SENA
 * ==========================================
 */

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v || 0);

const formatFecha = (f) => {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const ESTADOS = {
  pendiente: { color: 'bg-yellow-100 text-yellow-700', label: 'Pendiente' },
  confirmada: { color: 'bg-green-100 text-green-700', label: 'Confirmada' },
  cancelada: { color: 'bg-red-100 text-red-700', label: 'Cancelada' },
};

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [nuevaReserva, setNuevaReserva] = useState({
    huesped_id: '',
    alojamiento_id: '',
    fecha_entrada: '',
    fecha_salida: '',
  });
  const [pagoReserva, setPagoReserva] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [rRes, rFin, rHue] = await Promise.all([
        api.get('/reservas'),
        api.get('/fincas'),
        api.get('/huespedes'),
      ]);

      const listaReservas = rRes.data?.data || (Array.isArray(rRes.data) ? rRes.data : []);
      const listaFincas = rFin.data?.data || (Array.isArray(rFin.data) ? rFin.data : []);
      const listaHuespedes = rHue.data?.data || (Array.isArray(rHue.data) ? rHue.data : []);

      setReservas(listaReservas);
      setFincas(listaFincas);
      setHuespedes(listaHuespedes);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cambiarEstado = async (id, accion) => {
    try {
      await api.put(`/reservas/${id}/${accion}`);
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar el estado');
    }
  };

  const eliminarReserva = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta reserva?')) return;
    try {
      await api.delete(`/reservas/${id}`);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar la reserva');
    }
  };

  const handleCrearReserva = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservas', {
        huesped_id: parseInt(nuevaReserva.huesped_id),
        alojamiento_id: parseInt(nuevaReserva.alojamiento_id),
        fecha_entrada: nuevaReserva.fecha_entrada,
        fecha_salida: nuevaReserva.fecha_salida,
      });

      alert('Reserva creada con éxito');
      setShowModal(false);
      setNuevaReserva({
        huesped_id: '',
        alojamiento_id: '',
        fecha_entrada: '',
        fecha_salida: '',
      });
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear la reserva');
    }
  };

  const handlePagoExitoso = () => {
    setPagoReserva(null);
    cargarDatos();
  };

  const hoy = new Date().toISOString().split('T')[0];

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#F3E5D8]">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-8 bg-[#F3E5D8] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-900 text-white px-5 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-green-800 transition-all"
          >
            <PlusCircle size={18} /> NUEVA RESERVA
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-white text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Alojamiento</th>
                <th className="px-6 py-5">Entrada</th>
                <th className="px-6 py-5">Salida</th>
                <th className="px-6 py-5 text-center">Estado</th>
                <th className="px-6 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-bold">
                    No hay reservas registradas
                  </td>
                </tr>
              ) : (
                reservas.map((r) => {
                  const cfg = ESTADOS[r.estado] || ESTADOS.pendiente;
                  return (
                    <tr key={r.id} className="border-b">
                      <td className="px-6 py-4">{r.nombre_cliente || r.huesped_nombre || 'Sin nombre'}</td>
                      <td className="px-6 py-4">{r.alojamiento_nombre || r.finca_nombre || 'Sin alojamiento'}</td>
                      <td className="px-6 py-4">{formatFecha(r.fecha_entrada)}</td>
                      <td className="px-6 py-4">{formatFecha(r.fecha_salida)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center items-center">
                          {r.estado === 'pendiente' && !r.estado_pago?.startsWith('Pag') && (
                            <button
                              onClick={() => setPagoReserva(r)}
                              className="bg-green-700 text-white px-3 py-1.5 rounded-xl text-xs font-black hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                              <CreditCard size={12} />
                              Pagar
                            </button>
                          )}
                          <button onClick={() => cambiarEstado(r.id, 'confirmar')}>
                            <CheckCircle size={16} className="text-green-600" />
                          </button>
                          <button onClick={() => cambiarEstado(r.id, 'cancelar')}>
                            <XCircle size={16} className="text-red-500" />
                          </button>
                          <button onClick={() => eliminarReserva(r.id)}>
                            <Trash2 size={16} className="text-gray-400 hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black mb-6">Nueva Reserva</h2>
            <form onSubmit={handleCrearReserva} className="space-y-4">
              
              {/* SELECT DE HUÉSPED */}
              <select
                required
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold"
                value={nuevaReserva.huesped_id}
                onChange={(e) => setNuevaReserva({ ...nuevaReserva, huesped_id: e.target.value })}
              >
                <option value="">Seleccionar Huésped</option>
                {huespedes.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.nombre || h.nombre_completo}
                  </option>
                ))}
              </select>

              {/* SELECT DE ALOJAMIENTO - ADAPTADO AL CONTROLADOR */}
              <select
                required
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-green-800"
                value={nuevaReserva.alojamiento_id}
                onChange={(e) => setNuevaReserva({ ...nuevaReserva, alojamiento_id: e.target.value })}
              >
                <option value="">Seleccionar Alojamiento</option>
                {fincas.length > 0 ? (
                  fincas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre || a.titulo} — {formatPrecio(a.precio_noche || a.precio)}/noche
                    </option>
                  ))
                ) : (
                  <option disabled>No hay alojamientos disponibles</option>
                )}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  required
                  min={hoy}
                  className="p-4 bg-gray-50 rounded-2xl font-bold"
                  value={nuevaReserva.fecha_entrada}
                  onChange={(e) => setNuevaReserva({ ...nuevaReserva, fecha_entrada: e.target.value })}
                />
                <input
                  type="date"
                  required
                  min={nuevaReserva.fecha_entrada || hoy}
                  className="p-4 bg-gray-50 rounded-2xl font-bold"
                  value={nuevaReserva.fecha_salida}
                  onChange={(e) => setNuevaReserva({ ...nuevaReserva, fecha_salida: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-black text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-900 text-white py-4 rounded-2xl font-black hover:bg-green-800 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pagoReserva && (
        <CheckoutForm
          reserva={pagoReserva}
          onClose={() => setPagoReserva(null)}
          onSuccess={handlePagoExitoso}
        />
      )}
    </div>
  );
}

export default Reservas;