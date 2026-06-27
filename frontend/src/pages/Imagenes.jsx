import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Plus, Loader2, ImageIcon } from 'lucide-react';

const PLACEHOLDER = 'https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL';

function Imagenes() {
  const [fincas, setFincas] = useState([]);
  const [fincaSeleccionada, setFincaSeleccionada] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [nuevaUrl, setNuevaUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    const cargarFincas = async () => {
      try {
        setLoading(true);
        const res = await api.get('/fincas');
        const lista = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setFincas(lista);
      } catch (err) {
        console.error('Error al cargar fincas:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarFincas();
  }, []);

  useEffect(() => {
    if (fincaSeleccionada) {
      const finca = fincas.find((f) => f.id === Number(fincaSeleccionada));
      setImagenes(finca?.imagenes || []);
    } else {
      setImagenes([]);
    }
  }, [fincaSeleccionada, fincas]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nuevaUrl.trim()) return;

    setAgregando(true);
    try {
      const res = await api.put(`/fincas/${fincaSeleccionada}/imagenes`, { url: nuevaUrl.trim() });
      setImagenes(res.data.data.imagenes || []);
      setNuevaUrl('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agregar imagen');
    } finally {
      setAgregando(false);
    }
  };

  const handleEliminar = async (index) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;

    try {
      const res = await api.delete(`/fincas/${fincaSeleccionada}/imagenes/${index}`);
      setImagenes(res.data.data.imagenes || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar imagen');
    }
  };

  const previewUrl = (url) => (url && url.trim() ? url.trim() : PLACEHOLDER);

  const fincaActual = fincas.find((f) => f.id === Number(fincaSeleccionada));

  return (
    <div className="p-8 bg-[#F3E5D8] min-h-screen ml-64">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Galería <span className="text-green-700">Multimedia</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
              SENA Rural Image Manager
            </p>
          </div>
        </div>

        {/* Selector de Finca */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-50 p-6 mb-8">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
            Seleccionar Alojamiento
          </label>
          <select
            value={fincaSeleccionada}
            onChange={(e) => setFincaSeleccionada(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Elige una finca --</option>
            {fincas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre} — {f.ubicacion}
              </option>
            ))}
          </select>
        </div>

        {fincaSeleccionada && (
          <>
            {/* Formulario para agregar imagen */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-50 p-6 mb-8">
              <form onSubmit={handleAgregar} className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[250px]">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    Añadir nueva imagen a {fincaActual?.nombre?.toUpperCase()}
                  </label>
                  <input
                    type="url"
                    value={nuevaUrl}
                    onChange={(e) => setNuevaUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={agregando || !nuevaUrl.trim()}
                  className="bg-green-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-green-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={16} />
                  {agregando ? 'Agregando...' : 'Agregar'}
                </button>
              </form>
            </div>

            {/* Grid de imágenes */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-700" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {imagenes.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-gray-400 font-bold">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Este alojamiento no tiene imágenes</p>
                    <p className="text-[10px] mt-1">Agrega una usando el formulario de arriba</p>
                  </div>
                ) : (
                  imagenes.map((url, i) => (
                    <div
                      key={i}
                      className="group relative bg-white rounded-[1.5rem] shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={previewUrl(url)}
                          alt={`Imagen ${i + 1} de ${fincaActual?.nombre}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.src = PLACEHOLDER; }}
                        />
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Foto {i + 1} de {imagenes.length}
                        </span>
                        <button
                          onClick={() => handleEliminar(i)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Eliminar imagen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {!fincaSeleccionada && (
          <div className="text-center py-20 text-gray-400 font-bold">
            <Camera size={64} className="mx-auto mb-4 opacity-20" />
            <p>Selecciona un alojamiento para ver sus imágenes</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Imagenes;
