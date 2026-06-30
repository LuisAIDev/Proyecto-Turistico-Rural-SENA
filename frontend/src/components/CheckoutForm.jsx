import { useState } from 'react';
import api from '../services/api';
import { CreditCard, CheckCircle, X, Loader } from 'lucide-react';

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v || 0);

function CheckoutForm({ reserva, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nombre_titular: '',
    numero_tarjeta: '',
    fecha_expiracion: '',
    cvv: '',
    metodo_pago: 'tarjeta',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recibo, setRecibo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'numero_tarjeta') {
      val = value.replace(/\D/g, '').slice(0, 16);
      val = val.replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'cvv') {
      val = value.replace(/\D/g, '').slice(0, 4);
    }
    if (name === 'fecha_expiracion') {
      val = value.replace(/\D/g, '').slice(0, 4);
      if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/pagos/procesar', {
        reserva_id: reserva.id,
        monto: reserva.total_pago,
        numero_tarjeta: form.numero_tarjeta,
        nombre_titular: form.nombre_titular,
        metodo_pago: form.metodo_pago,
      });

      setRecibo(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const estaPagando = reserva.estado_pago === 'Pagada' || reserva.estado === 'confirmada';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {recibo ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-green-800 mb-2">¡Pago Exitoso!</h2>
            <p className="text-gray-500 font-bold mb-6">{recibo.mensaje}</p>
            <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Transacción</span>
                <span className="font-black text-green-800">{recibo.transaccion_id}</span>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Alojamiento</span>
                <span className="font-black">{reserva.alojamiento_nombre || 'Finca'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Cliente</span>
                <span className="font-black">{reserva.nombre_cliente || 'Huésped'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Total pagado</span>
                <span className="font-black text-green-700">{formatPrecio(reserva.total_pago)}</span>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Estado</span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700">Pagada</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-900 text-white py-4 rounded-2xl font-black hover:bg-green-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={24} className="text-green-800" />
              <h2 className="text-2xl font-black">Pago de Reserva</h2>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold">Alojamiento</span>
                <span className="font-black">{reserva.alojamiento_nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold">Huésped</span>
                <span className="font-black">{reserva.nombre_cliente}</span>
              </div>
              <div className="border-t border-gray-200 my-2" />
              <div className="flex justify-between text-lg">
                <span className="text-gray-700 font-black">Total a pagar</span>
                <span className="font-black text-green-800">{formatPrecio(reserva.total_pago)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-bold text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="nombre_titular"
                placeholder="Nombre en la tarjeta"
                required
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold"
                value={form.nombre_titular}
                onChange={handleChange}
              />
              <input
                name="numero_tarjeta"
                placeholder="Número de tarjeta"
                required
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold"
                value={form.numero_tarjeta}
                onChange={handleChange}
                maxLength={19}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="fecha_expiracion"
                  placeholder="MM/AA"
                  required
                  className="p-4 bg-gray-50 rounded-2xl font-bold"
                  value={form.fecha_expiracion}
                  onChange={handleChange}
                  maxLength={5}
                />
                <input
                  name="cvv"
                  placeholder="CVV"
                  required
                  type="password"
                  className="p-4 bg-gray-50 rounded-2xl font-bold"
                  value={form.cvv}
                  onChange={handleChange}
                  maxLength={4}
                />
              </div>

              <p className="text-xs text-gray-400 font-bold text-center">
                Solo pagos de prueba — use una tarjeta que termine en <span className="text-green-700">4242</span>
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || estaPagando}
                  className="flex-1 bg-green-900 text-white py-4 rounded-2xl font-black hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Proceder al Pago'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutForm;
