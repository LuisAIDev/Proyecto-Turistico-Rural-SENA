import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, ArrowUpRight, Search } from 'lucide-react';

const Facturacion = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const obtenerFacturacion = async () => {
      try {
        const res = await api.get('/reservas');
        const datosProcesados = res.data.map((reserva) => ({
          id: reserva.id,
          fecha: reserva.fecha_entrada,
          cliente: reserva.huesped_nombre || 'Cliente General',
          finca: reserva.finca_nombre,
          monto: parseFloat(reserva.total || reserva.total_pago || 0),
          estado:
            reserva.estado?.toLowerCase() === 'confirmada'
              ? 'completado'
              : 'pendiente',
          metodo: 'Transferencia',
        }));
        setTransacciones(datosProcesados);
      } catch (error) {
        console.error('Error en facturación:', error);
      } finally {
        setLoading(false);
      }
    };
    obtenerFacturacion();
  }, []);

  const totalRecaudado = transacciones
    .filter((t) => t.estado === 'completado')
    .reduce((acc, curr) => acc + curr.monto, 0);

  const formatMoney = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);

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
          <button className="bg-white text-gray-700 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <Download size={20} />
          </button>
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
            <ArrowUpRight
              className="absolute right-6 top-6 opacity-20"
              size={40}
            />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Pagos Pendientes
            </p>
            <h2 className="text-3xl font-black text-gray-800 mt-2">
              {transacciones.filter((t) => t.estado === 'pendiente').length}
            </h2>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Transacciones Mes
            </p>
            <h2 className="text-3xl font-black text-gray-800 mt-2">
              {transacciones.length}
            </h2>
          </div>
        </div>

        {/* TABLA DE TRANSACCIONES */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-[0.2em]">
              Historial de Pagos
            </h3>
            <div className="flex gap-2">
              <div className="bg-white border rounded-xl px-3 py-2 flex items-center gap-2">
                <Search
                  size={16}
                  className="text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="outline-none text-xs font-bold w-32"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-5">Fecha / Cliente</th>
                  <th className="px-8 py-5">Propiedad</th>
                  <th className="px-8 py-5">Monto</th>
                  <th className="px-8 py-5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transacciones.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-green-50/30 transition-colors group">
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
                      <span
                        className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                          t.estado === 'completado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facturacion;
