import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Fincas = () => {
  const [fincas, setFincas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [nuevaFinca, setNuevaFinca] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    capacidad: '',
    precio_noche: '',
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

  useEffect(() => {
    obtenerFincas();
  }, []);

  const handleChange = (e) => {
    setNuevaFinca((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nuevaFinca.nombre || !nuevaFinca.ubicacion || !nuevaFinca.precio_noche) {
      alert('Por favor, rellene los campos obligatorios (*)');
      return;
    }

    try {
      const payload = {
        nombre: nuevaFinca.nombre.trim(),
        ubicacion: nuevaFinca.ubicacion.trim(),
        descripcion: nuevaFinca.descripcion.trim() || '',
        capacidad: nuevaFinca.capacidad ? parseInt(nuevaFinca.capacidad, 10) : 0,
        precio_noche: parseFloat(nuevaFinca.precio_noche),
      };

      await api.post('/fincas', payload);

      setModalAbierto(false);
      setNuevaFinca({ nombre: '', ubicacion: '', descripcion: '', capacidad: '', precio_noche: '' });
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
          onClick={() => setModalAbierto(true)}
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
                        onClick={() => eliminarFinca(finca.id, finca.nombre)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-sm transition duration-150 border border-red-200"
                        title="Eliminar propiedad">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {fincas.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No se han registrado alojamientos en el sistema actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#F3E9DC] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-[#d8ccbc]">
            <h2 className="text-xl font-bold text-[#0A4D27] mb-4 border-b-2 border-[#0A4D27] pb-2">
              Registrar Nuevo Alojamiento
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
                  rows="3"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4D27] resize-none"
                  placeholder="Detalles de las comodidades..."
                />
              </div>
              <div className="flex justify-between items-center pt-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
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
    </div>
  );
};

export default Fincas;
