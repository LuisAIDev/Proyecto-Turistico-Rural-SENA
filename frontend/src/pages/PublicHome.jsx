import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Phone,
  Users,
  Wifi,
  Waves,
  Snowflake,
  Flame,
  Bath,
  Utensils,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
} from 'lucide-react';
import api from '../services/api';
import heroImage from '../assets/hero.png';
import MisReservasModal from '../components/MisReservasModal';

const ICON_MAP = {
  wifi: Wifi,
  pool: Waves,
  ac_unit: Snowflake,
  local_fire_department: Flame,
  hot_tub: Bath,
  restaurant: Utensils,
};

const formInicial = {
  alojamiento_id: '',
  nombre: '',
  email: '',
  telefono: '',
  documento: '',
  fecha_entrada: '',
  fecha_salida: '',
};

function PublicHome() {
  const [alojamientos, setAlojamientos] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [estado, setEstado] = useState({ tipo: '', mensaje: '' });
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [galeriaAlojamiento, setGaleriaAlojamiento] = useState(null);
  const [galeriaIndice, setGaleriaIndice] = useState(0);
  const [showMisReservas, setShowMisReservas] = useState(false);
  const [soloOfertas, setSoloOfertas] = useState(false);

  useEffect(() => {
    const cargarAlojamientos = async () => {
      try {
        const res = await api.get('/public/alojamientos');
        const lista = (res.data.data || []).map((a) => {
          const nombre = (a.nombre || '').toLowerCase();
          if (nombre.includes('cielo mar') || nombre.includes('los calamares')) {
            return { ...a, descuento: nombre.includes('cielo mar') ? 20 : 15 };
          }
          return a;
        });
        setAlojamientos(lista);
        if (lista.length > 0) {
          setForm((prev) => ({ ...prev, alojamiento_id: String(lista[0].id) }));
        }
      } catch {
        setEstado({
          tipo: 'error',
          mensaje: 'No pudimos cargar los alojamientos disponibles.',
        });
      } finally {
        setCargando(false);
      }
    };

    cargarAlojamientos();
  }, []);

  const alojamientosFiltrados = useMemo(
    () => soloOfertas ? alojamientos.filter((a) => a.descuento) : alojamientos,
    [alojamientos, soloOfertas],
  );

  const ofertasActivas = useMemo(
    () => alojamientos.filter((a) => a.descuento),
    [alojamientos],
  );

  const alojamientoSeleccionado = useMemo(
    () => alojamientos.find((item) => String(item.id) === form.alojamiento_id),
    [alojamientos, form.alojamiento_id],
  );

  const noches = useMemo(() => {
    if (!form.fecha_entrada || !form.fecha_salida) return 0;
    const inicio = new Date(form.fecha_entrada);
    const fin = new Date(form.fecha_salida);
    return Math.max(Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)), 0);
  }, [form.fecha_entrada, form.fecha_salida]);

  const totalEstimado =
    alojamientoSeleccionado && noches > 0
      ? Number(alojamientoSeleccionado.precio_noche) * noches
      : 0;

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setEstado({ tipo: '', mensaje: '' });
  };

  const enviarReserva = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setEstado({ tipo: '', mensaje: '' });

    try {
      await api.post('/public/reservas', {
        ...form,
        alojamiento_id: Number(form.alojamiento_id),
      });

      setEstado({
        tipo: 'ok',
        mensaje:
          'Solicitud enviada. La reserva quedó pendiente y el equipo la confirmará pronto.',
      });
      setForm((prev) => ({
        ...formInicial,
        alojamiento_id: prev.alojamiento_id,
      }));
    } catch (error) {
      setEstado({
        tipo: 'error',
        mensaje:
          error.response?.data?.error ||
          'No se pudo enviar la solicitud. Revisa los datos e intenta de nuevo.',
      });
    } finally {
      setEnviando(false);
    }
  };

  const PLACEHOLDER_IMG = 'https://placehold.co/800x600/0A4D27/FFFFFF?text=SENA+RURAL';

  const abrirGaleria = (alojamiento, indice = 0) => {
    setGaleriaAlojamiento(alojamiento);
    setGaleriaIndice(indice);
  };

  return (
    <div className="min-h-screen bg-[#eef7ef] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#inicio" className="text-xl font-black tracking-tight text-slate-900">
            SENA <span className="text-green-700">RURAL</span>
          </a>
          <nav className="flex items-center gap-3 text-sm font-bold">
            <a href="#alojamientos" className="hidden text-slate-600 hover:text-green-700 sm:inline">
              Alojamientos
            </a>
            <a href="#reserva" className="hidden text-slate-600 hover:text-green-700 sm:inline">
              Reservar
            </a>
            <button
              onClick={() => setShowMisReservas(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-slate-600 hover:text-green-700"
            >
              <Star size={15} />
              Mis Reservas
            </button>
            <Link
              to="/login"
              className="rounded-md bg-green-700 px-4 py-2 text-white shadow-sm hover:bg-green-800">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main id="inicio">
        <section className="relative min-h-[82vh] overflow-hidden">
          <img
            src={heroImage}
            alt="Alojamiento rural rodeado de naturaleza"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-transparent" />
          <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-center px-5 py-16">
            <div className="max-w-2xl text-white">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-green-200">
                Turismo rural en Colombia
              </p>
              <h1 className="text-5xl font-black leading-tight sm:text-6xl">
                SENA RURAL
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
                Reserva alojamientos rurales, consulta servicios disponibles y
                envía tu solicitud para que el equipo confirme tu estadía.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#reserva"
                  className="rounded-md bg-green-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg hover:bg-green-700">
                  Solicitar reserva
                </a>
                <a
                  href="#alojamientos"
                  className="rounded-md border border-white/70 px-6 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-slate-900">
                  Ver alojamientos
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="alojamientos" className="mx-auto max-w-7xl px-5 py-14">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Alojamientos disponibles
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Estos espacios están publicados como disponibles por el equipo
                administrador.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {ofertasActivas.length > 0 && (
                <button
                  onClick={() => setSoloOfertas((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider transition-all ${
                    soloOfertas
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <Tag size={15} />
                  {soloOfertas ? 'Todas' : `Ofertas (${ofertasActivas.length})`}
                </button>
              )}
              <span className="text-sm font-bold text-green-700">
                {soloOfertas ? `${alojamientosFiltrados.length} en oferta` : `${alojamientos.length} opciones activas`}
              </span>
            </div>
          </div>

          {cargando ? (
            <div className="rounded-md bg-white p-8 text-center font-bold text-slate-500">
              Cargando alojamientos...
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {alojamientosFiltrados.map((alojamiento) => (
                <article
                  key={alojamiento.id}
                  className="rounded-md border border-green-100 bg-white shadow-sm">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-md bg-slate-100">
                    {alojamiento.descuento && (
                      <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Tag size={12} />
                        -{alojamiento.descuento}% OFF
                      </div>
                    )}
                    <img
                      src={alojamiento.imagenes?.[0] || PLACEHOLDER_IMG}
                      alt={alojamiento.nombre}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                    />
                  </div>
                  <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {alojamiento.nombre}
                      </h3>
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <MapPin size={16} className="text-green-700" />
                        {alojamiento.ubicacion}
                      </p>
                    </div>
                    <span className="rounded-md bg-green-50 px-3 py-1 text-xs font-black uppercase text-green-700">
                      {alojamiento.estado}
                    </span>
                  </div>

                  <p className="mt-4 min-h-16 text-sm leading-6 text-slate-600">
                    {alojamiento.descripcion || 'Alojamiento rural con servicios para descanso y turismo local.'}
                  </p>

                  {alojamiento.total_valoraciones > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={14}
                            className={n <= Math.round(alojamiento.rating_promedio || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-500">
                        {alojamiento.rating_promedio} ({alojamiento.total_valoraciones} {alojamiento.total_valoraciones === 1 ? 'opinión' : 'opiniones'})
                      </span>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Users size={17} className="text-green-700" />
                      Hasta {alojamiento.capacidad || 0} personas
                    </span>
                    <span className="text-right">
                      {alojamiento.descuento ? (
                        <>
                          <span className="block text-xs font-bold text-gray-400 line-through">
                            ${Number(alojamiento.precio_noche).toLocaleString('es-CO')}
                          </span>
                          <span className="text-lg font-black text-red-500">
                            ${(Number(alojamiento.precio_noche) * (1 - alojamiento.descuento / 100)).toLocaleString('es-CO')}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-black text-green-700">
                          ${Number(alojamiento.precio_noche).toLocaleString('es-CO')}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {alojamiento.servicios?.length > 0 ? (
                      alojamiento.servicios.map((servicio) => {
                        const Icon = ICON_MAP[servicio.icono] || CheckCircle2;
                        return (
                          <span
                            key={servicio.id}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            <Icon size={13} />
                            {servicio.nombre}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        Servicios por confirmar
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => abrirGaleria(alojamiento, 0)}
                    className="mt-4 w-full rounded-lg border-2 border-dashed border-green-300 bg-green-50/50 px-4 py-3 text-sm font-black uppercase tracking-wider text-green-800 transition-all hover:border-green-500 hover:bg-green-100 hover:text-green-900 flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={18} />
                    Ver Galería
                  </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="reserva" className="bg-white py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_420px]">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Solicita tu reserva
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Completa tus datos y fechas. La solicitud entra al panel de
                reservas como pendiente para que el administrador la confirme.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-md bg-green-50 p-4">
                  <CalendarDays className="mb-3 text-green-700" size={24} />
                  <h3 className="font-black">Fechas claras</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    El sistema bloquea rangos que ya tienen reserva.
                  </p>
                </div>
                <div className="rounded-md bg-green-50 p-4">
                  <Phone className="mb-3 text-green-700" size={24} />
                  <h3 className="font-black">Contacto directo</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    El equipo usa tu teléfono para confirmar detalles.
                  </p>
                </div>
                <div className="rounded-md bg-green-50 p-4">
                  <CheckCircle2 className="mb-3 text-green-700" size={24} />
                  <h3 className="font-black">Reserva pendiente</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    La confirmación final queda en manos del administrador.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={enviarReserva}
              className="rounded-md border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <label className="block text-sm font-black text-slate-700">
                Alojamiento
              </label>
              <select
                value={form.alojamiento_id}
                onChange={(e) => actualizarCampo('alojamiento_id', e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-white p-3 font-semibold outline-none focus:border-green-600"
                required>
                {alojamientos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre} - ${Number(item.precio_noche).toLocaleString('es-CO')}
                  </option>
                ))}
              </select>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Nombre completo" value={form.nombre} onChange={(v) => actualizarCampo('nombre', v)} />
                <Input label="Teléfono" value={form.telefono} onChange={(v) => actualizarCampo('telefono', v)} />
                <Input label="Correo" type="email" value={form.email} onChange={(v) => actualizarCampo('email', v)} required={false} />
                <Input label="Documento" value={form.documento} onChange={(v) => actualizarCampo('documento', v)} required={false} />
                <Input label="Entrada" type="date" value={form.fecha_entrada} onChange={(v) => actualizarCampo('fecha_entrada', v)} />
                <Input label="Salida" type="date" value={form.fecha_salida} onChange={(v) => actualizarCampo('fecha_salida', v)} />
              </div>

              <div className="mt-5 rounded-md bg-white p-4">
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Noches</span>
                  <span>{noches}</span>
                </div>
                <div className="mt-2 flex justify-between text-lg font-black text-slate-900">
                  <span>Total estimado</span>
                  <span>${totalEstimado.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {estado.mensaje && (
                <div
                  className={`mt-4 rounded-md p-3 text-sm font-bold ${
                    estado.tipo === 'ok'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  {estado.mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando || alojamientos.length === 0}
                className="mt-5 w-full rounded-md bg-green-700 px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-sm hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400">
                {enviando ? 'Enviando solicitud...' : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </section>
      </main>

      {showMisReservas && (
        <MisReservasModal onClose={() => setShowMisReservas(false)} />
      )}

      {/* MODAL GALERÍA PÚBLICA */}
      {galeriaAlojamiento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">
                {galeriaAlojamiento.nombre}
              </h3>
              <button
                onClick={() => setGaleriaAlojamiento(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <div className="relative flex items-center justify-center bg-gray-900" style={{ minHeight: '380px' }}>
              {(galeriaAlojamiento.imagenes || []).length > 0 ? (
                <>
                  <img
                    src={galeriaAlojamiento.imagenes[galeriaIndice] || PLACEHOLDER_IMG}
                    alt={`Foto ${galeriaIndice + 1}`}
                    className="max-h-[55vh] max-w-full object-contain p-4"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                  />
                  {(galeriaAlojamiento.imagenes || []).length > 1 && (
                    <>
                      <button
                        onClick={() => setGaleriaIndice((prev) => (prev - 1 + galeriaAlojamiento.imagenes.length) % galeriaAlojamiento.imagenes.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg hover:bg-white transition-all"
                      >
                        <ChevronLeft size={22} className="text-gray-800" />
                      </button>
                      <button
                        onClick={() => setGaleriaIndice((prev) => (prev + 1) % galeriaAlojamiento.imagenes.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg hover:bg-white transition-all"
                      >
                        <ChevronRight size={22} className="text-gray-800" />
                      </button>
                    </>
                  )}
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white">
                    {galeriaIndice + 1} / {galeriaAlojamiento.imagenes.length}
                  </span>
                </>
              ) : (
                <div className="text-center text-white py-10">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="font-bold">Sin imágenes disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Input = ({ label, value, onChange, type = 'text', required = true }) => (
  <label className="block text-sm font-black text-slate-700">
    {label}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-2 w-full rounded-md border border-slate-200 bg-white p-3 font-semibold outline-none focus:border-green-600"
    />
  </label>
);

export default PublicHome;
