import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

const ICON_MAP = {
  wifi: <span className="text-sm">📶</span>,
  pool: <span className="text-sm">🏊</span>,
  ac_unit: <span className="text-sm">❄️</span>,
  local_fire_department: <span className="text-sm">🔥</span>,
  hot_tub: <span className="text-sm">🛁</span>,
  restaurant: <span className="text-sm">🍽️</span>,
};

const Fincas = () => {
  const [fincas, setFincas] = useState([]);
  const [todosLosServicios, setTodosLosServicios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [galeriaFinca, setGaleriaFinca] = useState(null);
  const [galeriaIndice, setGaleriaIndice] = useState(0);
  const [nuevaUrlGaleria, setNuevaUrlGaleria] = useState('');
  const [agregandoImg, setAgregandoImg] = useState(false);

  const [nuevaFinca, setNuevaFinca] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    capacidad: '',
    precio_noche: '',
    imagenes: [''],
    servicios_ids: [],
  });

  const obtenerFincas = async () => {
    try {
      setCargando(true);
      const res = await api.get('/fincas');
      const lista = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setFincas(lista);
    } catch (error) {
      console.error('Error al cargar alojamientos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarServicios = async () => {
    try {
      const res = await api.get('/servicios');
      setTodosLosServicios(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('Error al cargar servicios:', e);
    }
  };

  useEffect(() => {
    obtenerFincas();
    cargarServicios();
  }, []);

  const handleChange = (e) => {
    setNuevaFinca((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleServicio = (id) => {
    setNuevaFinca((prev) => {
      const exists = prev.servicios_ids.includes(id);
      return {
        ...prev,
        servicios_ids: exists
          ? prev.servicios_ids.filter((sid) => sid !== id)
          : [...prev.servicios_ids, id],
      };
    });
  };

  const handleImagenChange = (index, value) => {
    setNuevaFinca((prev) => {
      const nuevas = [...prev.imagenes];
      nuevas[index] = value;
      return { ...prev, imagenes: nuevas };
    });
  };

  const agregarCampoImagen = () => {
    setNuevaFinca((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ''],
    }));
  };

  const quitarImagen = (index) => {
    setNuevaFinca((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  const abrirEdicion = (finca) => {
    setEditandoId(finca.id);
    setNuevaFinca({
      nombre: finca.nombre || '',
      ubicacion: finca.ubicacion || '',
      descripcion: finca.descripcion || '',
      capacidad: finca.capacidad ? String(finca.capacidad) : '',
      precio_noche: finca.precio_noche ? String(finca.precio_noche) : '',
      imagenes: (finca.imagenes || []).length > 0 ? [...finca.imagenes] : [''],
      servicios_ids: finca.servicios_ids || finca.servicios?.map((s) => s.id) || [],
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setNuevaFinca({ nombre: '', ubicacion: '', descripcion: '', capacidad: '', precio_noche: '', imagenes: [''], servicios_ids: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nuevaFinca.nombre || !nuevaFinca.ubicacion || !nuevaFinca.precio_noche) {
      alert('Por favor, rellene los campos obligatorios (*)');
      return;
    }

    try {
      const imagenesValidas = nuevaFinca.imagenes.filter((u) => u.trim().length > 0);
      const payload = {
        nombre: nuevaFinca.nombre.trim(),
        ubicacion: nuevaFinca.ubicacion.trim(),
        descripcion: nuevaFinca.descripcion.trim() || '',
        capacidad: nuevaFinca.capacidad ? parseInt(nuevaFinca.capacidad, 10) : 0,
        precio_noche: parseFloat(nuevaFinca.precio_noche),
        imagenes: imagenesValidas.length > 0 ? imagenesValidas : undefined,
        servicios_ids: nuevaFinca.servicios_ids,
      };

      if (editandoId) {
        await api.put(`/fincas/${editandoId}`, payload);
      } else {
        await api.post('/fincas', payload);
      }

      cerrarModal();
      await obtenerFincas();
    } catch (error) {
      const mensaje = error.response?.data?.error || 'No se pudo guardar el alojamiento';
      alert(`Error: ${mensaje}`);
    }
  };

  const eliminarFinca = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el alojamiento "${nombre}"?`)) return;

    try {
      await api.delete(`/fincas/${id}`);
      setFincas((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error del servidor';
      if (mensaje.toLowerCase().includes('reservas')) {
        alert('No se puede eliminar la finca porque tiene reservas asociadas.');
      } else {
        alert(`No se pudo eliminar: ${mensaje}`);
      }
    }
  };

  const refrescarGaleria = async () => {
    if (!galeriaFinca) return;
    try {
      const res = await api.get('/fincas');
      const lista = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const actualizada = lista.find((f) => f.id === galeriaFinca.id);
      if (actualizada) {
        setGaleriaFinca(actualizada);
        setFincas((prev) => prev.map((f) => (f.id === actualizada.id ? actualizada : f)));
      }
    } catch (e) {
      console.warn('Error al refrescar galería:', e);
    }
  };

  const handleAgregarImagenGaleria = async (e) => {
    e.preventDefault();
    if (!nuevaUrlGaleria.trim()) return;
    setAgregandoImg(true);
    try {
      await api.put(`/fincas/${galeriaFinca.id}/imagenes`, { url: nuevaUrlGaleria.trim() });
      setNuevaUrlGaleria('');
      await refrescarGaleria();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agregar imagen');
    } finally {
      setAgregandoImg(false);
    }
  };

  const handleEliminarImagenGaleria = async (index) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;
    try {
      await api.delete(`/fincas/${galeriaFinca.id}/imagenes/${index}`);
      const nuevoTotal = (galeriaFinca.imagenes || []).length - 1;
      if (galeriaIndice >= nuevoTotal && nuevoTotal > 0) {
        setGaleriaIndice(nuevoTotal - 1);
      }
      await refrescarGaleria();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar imagen');
    }
  };

  const abrirGaleria = (finca) => {
    setGaleriaFinca(finca);
    setGaleriaIndice(0);
  };

  const galeriaAnterior = () => {
    if (!galeriaFinca) return;
    const total = (galeriaFinca.imagenes || []).length;
    setGaleriaIndice((prev) => (prev - 1 + total) % total);
  };

  const galeriaSiguiente = () => {
    if (!galeriaFinca) return;
    const total = (galeriaFinca.imagenes || []).length;
    setGaleriaIndice((prev) => (prev + 1) % total);
  };

  const previewImagen = (url) => {
    if (!url || !url.trim()) return 'https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL';
    return url.trim();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pl-72">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A4D27] tracking-tight">
            GESTIÓN DE ALOJAMIENTOS
          </h1>
          <p className="text-gray-600 mt-1">
            Módulo administrativo para el ingreso y control de propiedades rurales del sistema.
          </p>
        </div>
        <button
          onClick={() => { setEditandoId(null); setNuevaFinca({ nombre: '', ubicacion: '', descripcion: '', capacidad: '', precio_noche: '', imagenes: [''], servicios_ids: [] }); setModalAbierto(true); }}
          className="bg-[#0A4D27] hover:bg-[#083e1f] text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200">
          + Ingresar Nuevo Alojamiento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            Cargando catálogo de alojamientos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A4D27] text-white">
                  <th className="p-4 font-semibold">Propiedad</th>
                  <th className="p-4 font-semibold">Ubicación</th>
                  <th className="p-4 font-semibold text-center">Capacidad</th>
                  <th className="p-4 font-semibold text-right">Tarifa por Noche</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                  <th className="p-4 font-semibold text-center">Galería</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fincas.map((finca, index) => (
                  <tr key={finca.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-[#0A4D27]">
                      {finca.nombre ? finca.nombre.toUpperCase() : 'SIN NOMBRE'}
                    </td>
                    <td className="p-4 text-gray-600">{finca.ubicacion}</td>
                    <td className="p-4 text-center text-gray-700">
                      {finca.capacidad || 0} personas
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-700">
                      ${finca.precio_noche ? Number(finca.precio_noche).toLocaleString('co') : 0}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
                        {finca.estado || 'disponible'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => abrirGaleria(finca)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1 px-3 rounded-lg text-sm transition duration-150 border border-blue-200"
                        title="Ver galería de imágenes">
                        <ImageIcon size={16} className="inline mr-1" />
                        Ver Galería
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirEdicion(finca)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-1 px-3 rounded-lg text-sm transition duration-150 border border-amber-200"
                          title="Editar propiedad">
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarFinca(finca.id, finca.nombre)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-sm transition duration-150 border border-red-200"
                          title="Eliminar propiedad">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {fincas.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      No se han registrado alojamientos en el sistema actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL REGISTRAR NUEVO ALOJAMIENTO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#F3E9DC] p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-[#d8ccbc] my-8">
            <h2 className="text-xl font-bold text-[#0A4D27] mb-4 border-b-2 border-[#0A4D27] pb-2">
              {editandoId ? 'Editar Alojamiento' : 'Registrar Nuevo Alojamiento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nombre del Alojamiento *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevaFinca.nombre}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4D27]"
                  placeholder="Ej: Finca Sena Rural"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ubicación / Municipio *
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={nuevaFinca.ubicacion}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4D27]"
                  placeholder="Ej: Turbaco"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Capacidad (Pers.)
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    value={nuevaFinca.capacidad}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4D27]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tarifa por Noche *
                  </label>
                  <input
                    type="number"
                    name="precio_noche"
                    value={nuevaFinca.precio_noche}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4D27]"
                    placeholder="Tarifa en $"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Descripción de la Propiedad
                </label>
                <textarea
                  name="descripcion"
                  value={nuevaFinca.descripcion}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4D27] resize-none"
                  placeholder="Detalles de las comodidades..."
                />
              </div>

              {/* URLs de Imágenes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-gray-700">
                    URLs de Imágenes
                  </label>
                  <button
                    type="button"
                    onClick={agregarCampoImagen}
                    className="text-[#0A4D27] text-xs font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Agregar imagen
                  </button>
                </div>
                <div className="space-y-2">
                  {nuevaFinca.imagenes.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImagenChange(i, e.target.value)}
                        className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D27]"
                        placeholder={`https://ejemplo.com/imagen${i + 1}.jpg`}
                      />
                      {nuevaFinca.imagenes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => quitarImagen(i)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios */}
              {todosLosServicios.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Servicios Disponibles
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-lg border border-gray-200">
                    {todosLosServicios.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-[#0A4D27] focus:ring-[#0A4D27]"
                          checked={nuevaFinca.servicios_ids.includes(s.id)}
                          onChange={() => toggleServicio(s.id)}
                        />
                        <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                          {ICON_MAP[s.icono] || '📋'} {s.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 gap-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2.5 px-5 rounded-lg transition duration-150">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0A4D27] hover:bg-[#083e1f] text-white font-bold py-2.5 px-5 rounded-lg shadow transition duration-150">
                  Guardar Propiedad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GALERÍA DE IMÁGENES */}
      {galeriaFinca && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">
                {galeriaFinca.nombre?.toUpperCase() || 'GALERÍA'}
              </h3>
              <button
                onClick={() => setGaleriaFinca(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="relative bg-gray-900 flex items-center justify-center" style={{ minHeight: '400px' }}>
              {(galeriaFinca.imagenes || []).length > 0 ? (
                <>
                  <img
                    src={previewImagen(galeriaFinca.imagenes[galeriaIndice])}
                    alt={`Imagen ${galeriaIndice + 1}`}
                    className="max-w-full max-h-[60vh] object-contain p-4"
                    onError={(e) => { e.target.src = 'https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL'; }}
                  />
                  {(galeriaFinca.imagenes || []).length > 1 && (
                    <>
                      <button
                        onClick={galeriaAnterior}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <ChevronLeft size={24} className="text-gray-800" />
                      </button>
                      <button
                        onClick={galeriaSiguiente}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <ChevronRight size={24} className="text-gray-800" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {galeriaIndice + 1} / {(galeriaFinca.imagenes || []).length}
                  </div>
                </>
              ) : (
                <div className="text-white text-center p-10">
                  <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">Este alojamiento no tiene imágenes</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50 border-t border-gray-100">
              {(galeriaFinca.imagenes || []).length > 0 ? (
                galeriaFinca.imagenes.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0 group">
                    <button
                      onClick={() => setGaleriaIndice(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === galeriaIndice ? 'border-[#0A4D27] ring-2 ring-[#0A4D27]/30' : 'border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={previewImagen(url)}
                        alt={`Miniatura ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL'; }}
                      />
                    </button>
                    <button
                      onClick={() => handleEliminarImagenGaleria(i)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center bg-red-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-xs font-bold py-2">
                  Sin imágenes
                </div>
              )}
            </div>

            {/* ADMINISTRAR IMÁGENES */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Administrar Imágenes de este Alojamiento
              </p>
              <form onSubmit={handleAgregarImagenGaleria} className="flex gap-3">
                <input
                  type="url"
                  value={nuevaUrlGaleria}
                  onChange={(e) => setNuevaUrlGaleria(e.target.value)}
                  placeholder="Pegar URL de la nueva imagen aquí..."
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none font-bold focus:ring-2 focus:ring-[#0A4D27]"
                />
                <button
                  type="submit"
                  disabled={agregandoImg || !nuevaUrlGaleria.trim()}
                  className="bg-[#0A4D27] hover:bg-[#083e1f] text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  {agregandoImg ? '...' : 'Agregar Imagen'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fincas;
