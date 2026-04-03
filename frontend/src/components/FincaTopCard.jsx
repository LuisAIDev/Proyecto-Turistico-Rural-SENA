import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Usamos tu instancia de axios personalizada

const FincaTopCard = () => {
  const [fincaTop, setFincaTop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarKPI = async () => {
      try {
        // Llamamos al endpoint de rentabilidad que configuramos en el backend
        const res = await api.get('/reservas/kpi/rentabilidad');

        // El backend devuelve { finca: "Nombre", total_generado: 1000 }
        if (res.data && res.data.finca) {
          setFincaTop(res.data);
        }
      } catch (err) {
        console.error('❌ Error cargando el KPI de rentabilidad:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarKPI();
  }, []);

  // Si está cargando, mostramos un estado elegante
  if (loading)
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-pulse mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );

  // Si no hay datos (ej. no hay reservas confirmadas), no mostramos la tarjeta
  if (!fincaTop || !fincaTop.finca) return null;

  return (
    <div className="bg-gradient-to-r from-[#14532D] to-[#166534] p-6 rounded-3xl shadow-lg text-white mb-8 transform hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden">
      {/* Círculo decorativo de fondo */}
      <div className="absolute -right-6 -bottom-6 bg-white opacity-5 w-32 h-32 rounded-full"></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-green-300 text-xs font-bold uppercase tracking-widest">
            Alojamiento Estrella ⭐
          </p>
          <h2 className="text-3xl font-black mt-1 drop-shadow-sm uppercase">
            {fincaTop.finca}
          </h2>
        </div>
        <div className="bg-white/20 backdrop-blur-md w-14 h-14 flex items-center justify-center rounded-2xl text-3xl shadow-inner">
          🏆
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between relative z-10">
        <div>
          <p className="text-xs text-green-200 font-bold uppercase">
            Ingresos Totales Generados
          </p>
          <p className="text-4xl font-black">
            $
            {new Intl.NumberFormat('es-CO').format(
              fincaTop.total_generado || 0,
            )}
          </p>
        </div>
        <div className="text-right">
          <span className="bg-green-400/30 text-white px-4 py-1.5 rounded-full text-xs font-black border border-white/20 backdrop-blur-sm">
            MÁXIMO RENDIMIENTO
          </span>
        </div>
      </div>
    </div>
  );
};

export default FincaTopCard;
