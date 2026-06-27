import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Download, ArrowUpRight, Search, Plus, X } from 'lucide-react';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(val);

const Facturacion = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [resumen, setResumen] = useState({ totalRecaudado: 0, pagosPendientes: 0, transaccionesMes: 0 });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [alojamientos, setAlojamientos] = useState([]);
  const [formPago, setFormPago] = useState({
    cliente: '',
    alojamiento_id: '',
    monto: '',
    estado: 'completado',
    descripcion: '',
  });

  const cargarFacturacion = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservas/facturacion');
      setTransacciones(res.data.transacciones || []);
      setResumen(res.data.resumen || {});
    } catch (error) {
      console.error('Error en facturación:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarFacturacion();
  }, [cargarFacturacion]);

  useEffect(() => {
    const cargarAlojamientos = async () => {
      try {
        const res = await api.get('/fincas');
        setAlojamientos(res.data.data || res.data || []);
      } catch (e) {
        console.warn('Error al cargar alojamientos:', e);
      }
    };
    cargarAlojamientos();
  }, []);

  const totalRecaudado = resumen.totalRecaudado;
  const pagosPendientes = resumen.pagosPendientes;
  const transaccionesMes = resumen.transaccionesMes;

  const filtradas = transacciones.filter((t) => {
    const coincideBusqueda =
      !busqueda ||
      t.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.finca?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      filtroEstado === 'todas' || t.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const handleChangePago = (e) => {
    const { name, value } = e.target;
    setFormPago((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPago = async (e) => {
    e.preventDefault();
    if (!formPago.cliente.trim() || !formPago.monto || Number(formPago.monto) <= 0) {
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        cliente: formPago.cliente.trim(),
        monto: Number(formPago.monto),
        estado: formPago.estado,
        descripcion: formPago.descripcion.trim() || undefined,
      };
      if (formPago.alojamiento_id) {
        payload.alojamiento_id = Number(formPago.alojamiento_id);
        const aloj = alojamientos.find((a) => a.id === Number(formPago.alojamiento_id));
        if (aloj) payload.alojamiento_nombre = aloj.nombre;
      }
      await api.post('/pagos', payload);
      setFormPago({ cliente: '', alojamiento_id: '', monto: '', estado: 'completado', descripcion: '' });
      setModalAbierto(false);
      await cargarFacturacion();
    } catch (error) {
      console.error('Error al registrar pago:', error);
    } finally {
      setEnviando(false);
    }
  };

  const descargarCSV = () => {
    const encabezados = ['Fecha', 'Cliente', 'Propiedad', 'Monto', 'Estado', 'Método'];
    const filas = filtradas.map((t) => [
      new Date(t.fecha).toLocaleDateString(),
      t.cliente,
      t.finca,
      t.monto,
      t.estado,
      t.metodo,
    ]);
    const contenido = [encabezados, ...filas]
      .map((fila) => fila.join(','))
      .join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte-caja-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3E5D8] ml-64">
        <p className="text-green-800 font-black animate-bounce uppercase">
          Generando Reportes...
        </p>
      </div>
    );

  return (
    <div className="p-8 bg-[#F3E5D8] min-h-screen ml-64">
      <div className="max-w-6xl mx-auto">

        {/* ENCABEZADO */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Flujo de <span className="text-green-700">Caja</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
              SENA Rural Financial Center
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-green-700 text-white px-5 py-3 rounded-2xl shadow-sm hover:bg-green-800 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider"
            >
              <Plus size={16} />
              Registrar Pago
            </button>
            <button
              onClick={descargarCSV}
              className="bg-white text-gray-700 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              title="Descargar Reporte CSV"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* RESUMEN FINANCIERO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-green-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
              Saldo Total Recaudado
            </p>
            <h2 className="text-3xl font-black mt-2">
              {formatMoney(totalRecaudado)}
            </h2>
            <ArrowUpRight className="absolute right-6 top-6 opacity-20" size={40} />
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Pagos Pendientes
            </p>
            <h2 className="text-3xl font-black text-gray-800 mt-2">
              {pagosPendientes}
            </h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Transacciones Mes
            </p>
            <h2 className="text-3xl font-black text-gray-800 mt-2">
              {transaccionesMes}
            </h2>
          </div>
        </div>

        {/* FILTROS + TABLA */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-[0.2em]">
              Historial de Pagos
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white border rounded-xl px-3 py-2 flex items-center gap-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente o propiedad..."
                  className="outline-none text-xs font-bold w-32"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none"
              >
                <option value="todas">Todos los estados</option>
                <option value="completado">Completados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-5">Fecha / Cliente</th>
                  <th className="px-8 py-5">Propiedad</th>
                  <th className="px-8 py-5">Monto</th>
                  <th className="px-8 py-5">Método</th>
                  <th className="px-8 py-5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map((t) => (
                  <tr key={t.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-800 text-sm uppercase">
                        {t.cliente}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(t.fecha).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-600 uppercase">
                        {t.finca}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-800">
                      {formatMoney(t.monto)}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-gray-500 uppercase">
                        {t.metodo}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                        t.estado === 'completado'
                          ? 'bg-green-100 text-green-700'
                          : t.estado === 'cancelado'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">
                      No se encontraron transacciones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR PAGO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="font-black text-gray-800 uppercase text-sm tracking-wider">
                Registrar Pago Manual
              </h2>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitPago} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  name="cliente"
                  value={formPago.cliente}
                  onChange={handleChangePago}
                  required
                  placeholder="Nombre del cliente"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Alojamiento
                </label>
                <select
                  name="alojamiento_id"
                  value={formPago.alojamiento_id}
                  onChange={handleChangePago}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Sin alojamiento</option>
                  {alojamientos.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formPago.monto}
                  onChange={handleChangePago}
                  required
                  min="1"
                  step="100"
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formPago.estado}
                  onChange={handleChangePago}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 transition-colors"
                >
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formPago.descripcion}
                  onChange={handleChangePago}
                  rows={2}
                  placeholder="Nota opcional"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-green-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                {enviando ? 'Guardando...' : 'Guardar Pago'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturacion;
