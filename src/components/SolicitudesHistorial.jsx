import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { FaQrcode, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import './common/common.css'


const SolicitudesHistorial = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const { escuelaId } = useParams();
  
  // Obtener el tema actual
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const endpoint = escuelaId 
          ? `/auth/mis-solicitudes-inscripcion/escuela/${escuelaId}`
          : '/auth/mis-solicitudes-inscripcion';

        const response = await authService.api.get(endpoint);
        setSolicitudes(response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        toast.error('Error al cargar el historial de solicitudes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolicitudes();
  }, [escuelaId]);
  
  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return <FaClock className="text-yellow-500" />;
      case 'aprobada': return <FaCheckCircle className="text-green-500" />;
      case 'rechazada': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };
  
  const getStatusClass = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'aprobada': return 'bg-green-100 text-green-800 border-green-300';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  return (
    /*    <div className={`min-h-screen p-4 bg-image-class ${themeStyles.background} `}>*/
    <div className={`min-h-screen p-4 ${themeStyles.background} `}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold ${themeStyles.text} mb-8`}>
          Historial de Solicitudes de Inscripción
        </h1>
        
        {loading ? (
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center`}>
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`text-gray-600 dark:text-gray-400`}>Cargando solicitudes...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center`}>
            <p className={`text-gray-600 dark:text-gray-400`}>No hay solicitudes disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solicitudes.map(solicitud => (
              <div 
                key={solicitud._id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${themeStyles.borderColor}`}
              >
                <div className={`bg-gradient-to-r ${themeStyles.gradient} p-4 text-white`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {solicitud.escuelaId?.logoUrl && (
                        <img 
                          src={solicitud.escuelaId.logoUrl} 
                          alt="Logo escuela" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <h3 className="font-bold">{solicitud.escuelaId?.nombre || 'Escuela'}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(solicitud.estado)}`}>
                      {getStatusIcon(solicitud.estado)}
                      <span className="ml-1">
                        {solicitud.estado === 'pendiente' ? 'Pendiente' :
                         solicitud.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Fecha de solicitud:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {new Date(solicitud.fechaSolicitud).toLocaleDateString()} - 
                      {new Date(solicitud.fechaSolicitud).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Jugadores incluidos:
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {solicitud.ninos.length} jugador(es)
                    </p>
                  </div>
                  
                  {solicitud.estado === 'aprobada' && solicitud.precioTotal && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Precio total:
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        ${solicitud.precioTotal.toFixed(2)} MXN
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setSelectedSolicitud(solicitud)}
                      className={`flex items-center space-x-1 ${themeStyles.text} hover:text-blue-700`}
                    >
                      <FaEye />
                      <span>Ver detalles</span>
                    </button>
                    
                    {solicitud.codigoQR && (
                      <button
                        onClick={() => {
                          const qrImage = solicitud.codigoQR;
                          const newWindow = window.open('', '_blank');
                          newWindow.document.write(`
                            <html>
                              <head>
                                <title>Código QR</title>
                                <style>
                                  body {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100vh;
                                    background-color: #f9f9f9;
                                    font-family: Arial, sans-serif;
                                  }
                                  img {
                                    max-width: 300px;
                                    margin-bottom: 20px;
                                  }
                                  button {
                                    padding: 10px 20px;
                                    background-color: #4CAF50;
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    font-size: 16px;
                                  }
                                  button:hover {
                                    background-color: #45a049;
                                  }
                                </style>
                              </head>
                              <body>
                                <h2>Código QR</h2>
                                <img src="${qrImage}" alt="Código QR" />
                                <a href="${qrImage}" download="codigo-qr.png">
                                  <button>Descargar QR</button>
                                </a>
                              </body>
                            </html>
                          `);
                          newWindow.document.close();
                        }}
                        className={`flex items-center space-x-1 ${themeStyles.text} hover:text-purple-700`}
                      >
                        <FaQrcode />
                        <span>Ver QR</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal de detalles */}
        {selectedSolicitud && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden">
              <div className={`bg-gradient-to-r ${themeStyles.gradient} p-6 text-white`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Detalles de la Solicitud</h3>
                  <button 
                    onClick={() => setSelectedSolicitud(null)}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Escuela</h4>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedSolicitud.escuelaId?.nombre || 'No especificada'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Estado</h4>
                    <div className="flex items-center">
                      {getStatusIcon(selectedSolicitud.estado)}
                      <span className="ml-2 text-lg font-medium">
                        {selectedSolicitud.estado === 'pendiente' ? 'Pendiente' :
                         selectedSolicitud.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Solicitud</h4>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Date(selectedSolicitud.fechaSolicitud).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {selectedSolicitud.fechaRespuesta && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Respuesta</h4>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {new Date(selectedSolicitud.fechaRespuesta).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Jugadores Incluidos</h4>
                <div className="space-y-4">
                  {selectedSolicitud.ninos.map(nino => (
                    <div 
                      key={nino._id} 
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {nino.nombre} {nino.apellidos}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {nino.fechaNacimiento ? `${calcularEdad(nino.fechaNacimiento)} años` : 'Edad no especificada'}
                          </p>
                        </div>
                        
                        {selectedSolicitud.estado === 'aprobada' && nino.precio && (
                          <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                            ${nino.precio.toFixed(2)} MXN
                          </div>
                        )}
                      </div>
                      
                      {nino.categoria && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Categoría: </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{nino.categoria}</span>
                        </div>
                      )}
                      
                      {nino.observaciones && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Observaciones: </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{nino.observaciones}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {selectedSolicitud.comentarios && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Comentarios</h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {selectedSolicitud.comentarios}
                    </p>
                  </div>
                )}
                
                {selectedSolicitud.codigoQR && (
                  <div className="mt-6 text-center">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Código QR</h4>
                    <img 
                      src={selectedSolicitud.codigoQR} 
                      alt="Código QR" 
                      className="mx-auto max-w-[200px] max-h-[200px]"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Este código QR debe ser presentado al administrador para validar la inscripción.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Función helper para calcular la edad
const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const birth = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - birth.getFullYear();
  const m = hoy.getMonth() - birth.getMonth();
  
  if (m < 0 || (m === 0 && hoy.getDate() < birth.getDate())) {
    edad--;
  }
  
  return edad;
};

export default SolicitudesHistorial;
