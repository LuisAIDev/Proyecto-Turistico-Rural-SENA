import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FincasDashboard = () => {
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarFincas = async () => {
    try {
      // Usamos el puerto 4000 según tu terminal
      const respuesta = await axios.get('http://localhost:4000/api/fincas');
      setFincas(respuesta.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al traer las fincas:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFincas();
  }, []);

  if (loading)
    return (
      <p className="p-4 text-blue-600">
        Conectando con el servidor de Cartagena...
      </p>
    );

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Panel de Alojamientos
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left">Finca</th>
              <th className="py-3 px-4 border-b text-left">Ubicación</th>
              <th className="py-3 px-4 border-b text-left">Precio/Noche</th>
              <th className="py-3 px-4 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fincas.map((finca) => (
              <tr
                key={finca.id}
                className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 border-b">{finca.nombre}</td>
                <td className="py-3 px-4 border-b">{finca.ubicacion}</td>
                <td className="py-3 px-4 border-b text-green-600 font-semibold">
                  ${Number(finca.precio_noche).toLocaleString()}
                </td>
                <td className="py-3 px-4 border-b text-center">
                  <button className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md mr-2 text-sm">
                    Editar
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FincasDashboard;
