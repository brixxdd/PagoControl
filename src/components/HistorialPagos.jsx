import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { FaReceipt, FaCheck, FaTimes } from 'react-icons/fa';

const HistorialPagos = () => {
  const { escuelaId } = useParams();
  const [loading, setLoading] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [ninos, setNinos] = useState([]);
  const [selectedNino, setSelectedNino] = useState('todos');
  
  useEffect(() => {
    cargarDatos();
  }, [escuelaId]);
  
  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Obtener niños inscritos
      const ninosResponse = await authService.api.get(`api/ninos-inscritos?escuelaId=${escuelaId}`);
      setNinos(ninosResponse.data);
      
      // Obtener historial de pagos
      const pagosResponse = await authService.api.get(`api/historial-pagos?escuelaId=${escuelaId}`);
      setPagos(pagosResponse.data);
    } catch (error) {
      toast.error('Error al cargar historial de pagos');
    } finally {
      setLoading(false);
    }
  };
  
  const filtrarPagos = () => {
    if (selectedNino === 'todos') {
      return pagos;
    }
    return pagos.filter(pago => 
      pago.ninoId && 
      (pago.ninoId._id === selectedNino || pago.ninoId === selectedNino)
    );
  };
  
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Historial de Pagos</h1>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Mis Pagos</h2>
                
                <div className="mt-3 sm:mt-0">
                  <select
                    value={selectedNino}
                    onChange={(e) => setSelectedNino(e.target.value)}
                    className="p-2 border rounded-lg text-sm"
                  >
                    <option value="todos">Todos los niños</option>
                    {ninos.map((nino) => (
                      <option key={nino._id} value={nino._id}>
                        {nino.nombre} {nino.apellidoPaterno}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {filtrarPagos().length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Niño
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Concepto
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Periodo
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comprobante
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filtrarPagos().map((pago) => {
                        // Verificar si ninoId es un objeto o un string
                        const ninoId = pago.ninoId && pago.ninoId._id ? pago.ninoId._id : pago.ninoId;
                        const ninoNombre = pago.ninoId && pago.ninoId.nombre ? 
                          `${pago.ninoId.nombre} ${pago.ninoId.apellidoPaterno || ''}` : 
                          (ninos.find(n => n._id === ninoId)?.nombre ? 
                            `${ninos.find(n => n._id === ninoId).nombre} ${ninos.find(n => n._id === ninoId).apellidoPaterno || ''}` : 
                            'Niño no encontrado');
                        
                        return (
                          <tr key={pago._id}>
                            <td className="py-3 px-3 text-sm">{formatearFecha(pago.fechaPago)}</td>
                            <td className="py-3 px-3 text-sm">{ninoNombre}</td>
                            <td className="py-3 px-3 text-sm capitalize">{pago.concepto}</td>
                            <td className="py-3 px-3 text-sm">
                              {pago.periodoPago ? `${pago.periodoPago.mes}/${pago.periodoPago.ano}` : '-'}
                            </td>
                            <td className="py-3 px-3 text-sm font-medium">${pago.monto.toFixed(2)}</td>
                            <td className="py-3 px-3 text-sm">
                              {pago.comprobante ? (
                                <a 
                                  href={pago.comprobante} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Ver
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <FaReceipt className="mx-auto text-4xl text-gray-300 mb-3" />
                  <p>No hay registros de pagos</p>
                </div>
              )}
            </div>
            
            {/* Resumen de próximos pagos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Próximos Pagos</h2>
              
              {ninos.length > 0 ? (
                <div className="space-y-4">
                  {ninos.map((nino) => {
                    // Lógica para determinar fecha próximo pago
                    const fechaActual = new Date();
                    const dia = fechaActual.getDate();
                    let proximoPagoTexto;
                    
                    if (dia < 5) {
                      proximoPagoTexto = "Del 1 al 5 del mes actual";
                    } else if (dia < 15) {
                      proximoPagoTexto = "Del 15 al 20 del mes actual";
                    } else if (dia < 20) {
                      proximoPagoTexto = "Del 15 al 20 del mes actual";
                    } else {
                      const mes = (fechaActual.getMonth() + 1) % 12 || 12;
                      const nombreMes = new Date(fechaActual.getFullYear(), mes - 1).toLocaleString('es-MX', { month: 'long' });
                      proximoPagoTexto = `Del 1 al 5 de ${nombreMes}`;
                    }
                    
                    return (
                      <div key={nino._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{nino.nombre} {nino.apellidoPaterno}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Próximo pago: {proximoPagoTexto}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Mensualidad: ${nino.precio >= 0 ? nino.precio : '250'}
                            </p>
                          </div>
                          
                          {/* Mostrar estado del pago actual */}
                          <div>
                            {nino.pagoActualizado ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaCheck className="mr-1" /> Pagado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FaTimes className="mr-1" /> Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>No tienes niños inscritos en esta escuela.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistorialPagos;
