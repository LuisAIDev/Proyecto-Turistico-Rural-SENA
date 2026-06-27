import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  CircleSlash,
  Printer,
  UserPlus,
  Mail,
  Phone,
  CreditCard,
  Search,
  Loader2,
} from 'lucide-react';

function Huespedes() {
  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState('');

  const [nuevoHuesped, setNuevoHuesped] = useState({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
  });

  // 1. Cargar Huéspedes desde el Backend
  const cargarHuespedes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/huespedes');
      setHuespedes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error cargando huéspedes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHuespedes();
  }, []);

  // 2. Guardar Nuevo Huésped
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Nota: Si tu backend usa "documento" en lugar de "dni", cambia la clave aquí
      await api.post('/huespedes', nuevoHuesped);
      setShowModal(false);
      setNuevoHuesped({ nombre: '', email: '', telefono: '', dni: '' });
      cargarHuespedes();
      alert('¡Huésped registrado con éxito en SENA RURAL!');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al registrar el cliente.');
    }
  };

  // 3. Eliminar Registro
  const handleDelete = async (id) => {
    if (
      window.confirm(
        '¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.',
      )
    ) {
      try {
        await api.delete(`/huespedes/${id}`);
        cargarHuespedes();
      } catch {
        alert(
          'No se pudo eliminar. Es posible que el huésped tenga reservas activas.',
        );
      }
    }
  };

  // 4. Función de Impresión (Recibo)
  const imprimirRecibo = (h) => {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <head>
          <title>Recibo - ${h.nombre}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 3px solid #166534; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .info-box { background: #f9fafb; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; }
            .info-item { margin-bottom: 12px; font-size: 16px; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            h1 { color: #166534; margin: 0; font-size: 28px; }
            .stamp { color: #166534; border: 3px solid #166534; padding: 10px; display: inline-block; transform: rotate(-5deg); font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>SENA RURAL HUB</h1>
              <p>Turismo Comunitario - Cartagena, CO</p>
            </div>
            <div style="text-align: right">
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <h2 style="text-align: center; color: #374151;">COMPROBANTE DE REGISTRO</h2>
          <div class="info-box">
            <div class="info-item"><strong>Nombre:</strong> ${h.nombre}</div>
            <div class="info-item"><strong>Documento:</strong> ${h.dni || h.documento || 'No registrado'}</div>
            <div class="info-item"><strong>Teléfono:</strong> ${h.telefono}</div>
            <div class="info-item"><strong>Email:</strong> ${h.email}</div>
          </div>
          <div style="text-align: center;"><div class="stamp">REGISTRO VÁLIDO</div></div>
          <div class="footer">Documento interno de gestión SENA RURAL HUB.</div>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  };

  // 5. Filtrado en tiempo real
  const huespedesFiltrados = huespedes.filter(
    (h) =>
      (h.nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (h.dni || h.documento || '').includes(filtro),
  );

  return (
    <div className="p-8 bg-[#F3E5D8] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              Directorio de <span className="text-green-700">Huéspedes</span>
            </h2>
            <p className="text-gray-500 font-medium italic">
              Administración central SENA RURAL
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#14532D] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-green-800 transition-all active:scale-95">
            <UserPlus size={20} /> Nuevo Cliente
          </button>
        </div>

        {/* Tarjeta de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total de Huéspedes</p>
              <p className="text-2xl font-black text-gray-800">{huespedes.length}</p>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda */}
        <div className="mb-6 relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-green-500 outline-none font-bold"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">Identificación</th>
                <th className="px-6 py-5">Huésped</th>
                <th className="px-6 py-5">Contacto</th>
                <th className="px-6 py-5 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-700 mx-auto mb-2" />
                    <span className="text-green-700 font-bold">
                      Cargando base de datos...
                    </span>
                  </td>
                </tr>
              ) : huespedesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-400 font-bold">
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                huespedesFiltrados.map((h) => (
                  <tr
                    key={h.id}
                    className="hover:bg-green-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CreditCard
                          size={14}
                          className="text-gray-400"
                        />
                        {h.dni || h.documento}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {h.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                          <Phone
                            size={12}
                            className="text-green-600"
                          />{' '}
                          {h.telefono}
                        </span>
                        <span className="text-xs text-blue-500 italic flex items-center gap-1">
                          <Mail size={12} /> {h.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => imprimirRecibo(h)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Imprimir Ficha">
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Eliminar registro">
                          <CircleSlash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-gray-800 mb-6 text-center italic uppercase">
              Nuevo Registro
            </h3>
            <form
              onSubmit={handleSave}
              className="space-y-4">
              <input
                type="text"
                placeholder="Nombre Completo"
                required
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 outline-none font-bold"
                value={nuevoHuesped.nombre}
                onChange={(e) =>
                  setNuevoHuesped({ ...nuevoHuesped, nombre: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="DNI / Cédula"
                required
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 outline-none font-bold"
                value={nuevoHuesped.dni}
                onChange={(e) =>
                  setNuevoHuesped({ ...nuevoHuesped, dni: e.target.value })
                }
              />
              <input
                type="tel"
                placeholder="Teléfono"
                required
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 outline-none font-bold"
                value={nuevoHuesped.telefono}
                onChange={(e) =>
                  setNuevoHuesped({ ...nuevoHuesped, telefono: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                required
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 outline-none font-bold"
                value={nuevoHuesped.email}
                onChange={(e) =>
                  setNuevoHuesped({ ...nuevoHuesped, email: e.target.value })
                }
              />
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 text-gray-400 font-bold">
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-green-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-green-800">
                  GUARDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Huespedes;
