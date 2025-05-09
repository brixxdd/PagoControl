import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { alertaError } from './Alert';
import { FaArrowLeft, FaReceipt, FaCalendarAlt, FaUser, FaChild } from 'react-icons/fa';

const VerPago = () => {
  const { escuelaId, pagoId } = useParams();
  const navigate = useNavigate();
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPago = async () => {
      try {
        setLoading(true);
        const response = await authService.api.get(`/api/admin/pago/${pagoId}`);
        setPago(response.data);
      } catch (error) {
        console.error('Error al obtener detalles del pago:', error);
        alertaError('No se pudo cargar la información del pago');
      } finally {
        setLoading(false);
      }
    };

    fetchPago();
  }, [pagoId]);

  const obtenerNombreMes = (mes) => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[mes - 1];
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      <div className="max-w-4xl mx-auto">
        {/*<button 
          onClick={() => navigate(`/escuela/${escuelaId}/admin/pagos`)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft /> <span>Volver a Pagos</span>
        </button>*/}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pago ? (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <FaReceipt className="mr-2" /> Detalle de Pago
                </h1>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
                      <FaCalendarAlt className="mr-2 text-blue-500" /> Información del Pago
                    </h2>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="mb-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Fecha de pago:</span> 
                        <span className="ml-2 text-gray-800 dark:text-white">{formatearFecha(pago.fechaPago)}</span>
                      </p>
                      
                      <p className="mb-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Concepto:</span> 
                        <span className="ml-2 text-gray-800 dark:text-white capitalize">{pago.concepto}</span>
                      </p>
                      
                      <p className="mb-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Monto:</span> 
                        <span className="ml-2 text-gray-800 dark:text-white font-bold">${pago.monto.toFixed(2)}</span>
                      </p>
                      
                      {pago.periodoPago && (
                        <p className="mb-2">
                          <span className="font-medium text-gray-600 dark:text-gray-300">Periodo:</span> 
                          <span className="ml-2 text-gray-800 dark:text-white">
                            {obtenerNombreMes(pago.periodoPago.mes)} {pago.periodoPago.ano}
                          </span>
                        </p>
                      )}
                      
                      <p className="mb-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Método de pago:</span> 
                        <span className="ml-2 text-gray-800 dark:text-white capitalize">{pago.metodoPago || 'Efectivo'}</span>
                      </p>
                      
                      {pago.observaciones && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-600 dark:text-gray-300">Observaciones:</span>
                          <p className="mt-1 text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-600 p-2 rounded">
                            {pago.observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
                      <FaUser className="mr-2 text-blue-500" /> Información del Tutor
                    </h2>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {pago.tutorId ? (
                        <>
                          <p className="mb-2">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Nombre:</span> 
                            <span className="ml-2 text-gray-800 dark:text-white">
                              {pago.tutorId.nombre} {pago.tutorId.apellidos}
                            </span>
                          </p>
                          
                          <p className="mb-2">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Email:</span> 
                            <span className="ml-2 text-gray-800 dark:text-white">{pago.tutorId.email}</span>
                          </p>
                          
                          {pago.tutorId.telefono && (
                            <p className="mb-2">
                              <span className="font-medium text-gray-600 dark:text-gray-300">Teléfono:</span> 
                              <span className="ml-2 text-gray-800 dark:text-white">{pago.tutorId.telefono}</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Información del tutor no disponible</p>
                      )}
                    </div>
                    
                    <h2 className="text-lg font-semibold mt-6 mb-4 flex items-center text-gray-800 dark:text-white">
                      <FaChild className="mr-2 text-blue-500" /> Información del Jugador
                    </h2>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {pago.ninoId ? (
                        <>
                          <p className="mb-2">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Nombre:</span> 
                            <span className="ml-2 text-gray-800 dark:text-white">
                              {pago.ninoId.nombre} {pago.ninoId.apellidoPaterno} {pago.ninoId.apellidoMaterno}
                            </span>
                          </p>
                          
                          {pago.ninoId.claveCURP && (
                            <p className="mb-2">
                              <span className="font-medium text-gray-600 dark:text-gray-300">CURP:</span> 
                              <span className="ml-2 text-gray-800 dark:text-white">{pago.ninoId.claveCURP}</span>
                            </p>
                          )}
                          
                          {pago.ninoId.fechaNacimiento && (
                            <p className="mb-2">
                              <span className="font-medium text-gray-600 dark:text-gray-300">Fecha de nacimiento:</span> 
                              <span className="ml-2 text-gray-800 dark:text-white">
                                {new Date(pago.ninoId.fechaNacimiento).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Información del jugador no disponible</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {pago.referenciaPago && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Referencia de Pago</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-mono">{pago.referenciaPago}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/escuela/${escuelaId}/admin/pagos`)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-red-500">No se encontró la información del pago</p>
              <button
                onClick={() => navigate(`/escuela/${escuelaId}/admin/pagos`)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Volver a Pagos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerPago;
