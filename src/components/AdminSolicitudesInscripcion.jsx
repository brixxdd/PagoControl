import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaQrcode, FaEye, FaSave, FaArrowLeft, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import QRScanner from './QRScanner';

const AdminSolicitudesInscripcion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [filtroPor, setFiltroPor] = useState('todas'); // todas, pendientes, aprobadas, rechazadas
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [escuelasFiltro, setEscuelasFiltro] = useState([]);
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState('todas');
  const [comentarios, setComentarios] = useState('');
  const [precios, setPrecios] = useState([]);
  const { escuelaId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Si hay un escuelaId en los parámetros, lo usamos para filtrar
        const endpoint = escuelaId 
          ? `/admin/solicitudes-inscripcion/escuela/${escuelaId}`
          : '/admin/solicitudes-inscripcion';
          
        const response = await authService.api.get(endpoint);
        console.log('Solicitude de escuela' + response.data)
        setSolicitudes(response.data);
        
        // Obtenemos las escuelas únicas para el filtro
        if (!escuelaId) {
          const escuelasInfo = response.data.reduce((acc, sol) => {
            if (sol.escuelaId && !acc.some(e => e._id === sol.escuelaId._id)) {
              acc.push({
                _id: sol.escuelaId._id,
                nombre: sol.escuelaId.nombre
              });
            }
            return acc;
          }, []);
          
          setEscuelasFiltro(escuelasInfo);
        } else {
          setEscuelaSeleccionada(escuelaId);
        }
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        toast.error('Error al cargar solicitudes de inscripción');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [escuelaId]);
  
  useEffect(() => {
    // Al seleccionar una solicitud, inicializar los precios para cada niño
    if (selectedSolicitud) {
      const preciosIniciales = selectedSolicitud.ninos.map((nino, index) => ({
        ninoIndex: index,
        precio: nino.precio || 0,
        esUniforme: false
      }));
      setPrecios(preciosIniciales);
    }
  }, [selectedSolicitud]);
  
  /*const handleQrScan = (qrData) => {
    try {
      // Extraer la URL o el ID de la solicitud del código QR
      const solicitudId = qrData.solicitudId || qrData.id; // Asegúrate de que el formato sea correcto

      if (solicitudId) {
        const solicitud = solicitudes.find(s => s._id === solicitudId);
        
        if (solicitud) {
          setSelectedSolicitud(solicitud);
          setShowQrScanner(false);
        } else {
          // Si no lo encontramos en los ya cargados, intentar obtenerlo del servidor
          fetchSolicitudById(solicitudId);
        }
      }
    } catch (error) {
      console.error('Error al procesar QR:', error);
      toast.error('Código QR inválido');
    }
  };*/
  const handleQrScan = (qrData) => {
    try {
      // 1) decode + extraer el ID
      const raw = qrData.solicitudId || qrData; 
      const decoded = decodeURIComponent(raw);
      let id;
      try {
        id = new URL(decoded).pathname.split('/').pop();
      } catch {
        id = decoded;
      }
  
      // 2) buscar localmente o en el servidor
      const found = solicitudes.find(s => s._id === id);
      if (found) {
        setSelectedSolicitud(found);
        setShowQrScanner(false);
      } else {
        fetchSolicitudById(id);
      }
    } catch (error) {
      console.error('Error al procesar QR:', error);
      toast.error('Código QR inválido');
    }
  };
  
  
  const fetchSolicitudById = async (id) => {
    try {
      const response = await authService.api.get(`/admin/solicitud/${id}`);
      if (response.data) {
        setSelectedSolicitud(response.data);
        setShowQrScanner(false);
      }
    } catch (error) {
      console.error('Error al obtener solicitud:', error);
      toast.error('Solicitud no encontrada');
    }
  };
  
  const handlePrecioChange = (ninoIndex, valor) => {
    setPrecios(prev => {
      const nuevosPrecios = [...prev];
      const index = nuevosPrecios.findIndex(p => p.ninoIndex === ninoIndex);
      
      if (index !== -1) {
        nuevosPrecios[index].precio = parseFloat(valor) || 0;
      } else {
        nuevosPrecios.push({
          ninoIndex,
          precio: parseFloat(valor) || 0,
          esUniforme: false
        });
      }
      
      return nuevosPrecios;
    });
  };
  
  const handleUniformeChange = (ninoIndex, esUniforme) => {
    setPrecios(prev => {
      const nuevosPrecios = [...prev];
      const index = nuevosPrecios.findIndex(p => p.ninoIndex === ninoIndex);
      
      if (index !== -1) {
        nuevosPrecios[index].esUniforme = esUniforme;
      } else {
        nuevosPrecios.push({
          ninoIndex,
          precio: 0,
          esUniforme
        });
      }
      
      return nuevosPrecios;
    });
  };
  
  const calcularPrecioTotal = () => {
    return precios.reduce((total, item) => total + item.precio, 0);
  };
  
  const actualizarEstadoSolicitud = async (estado) => {
    if (!selectedSolicitud) return;
    
    try {
      // Validar que se hayan asignado precios si se va a aprobar
      if (estado === 'aprobada') {
        const faltanPrecios = precios.some(item => item.precio <= 0);
        if (faltanPrecios) {
          return toast.warning('Debes asignar un precio mayor a 0 a cada jugador antes de aprobar');
        }
      }
      
      const response = await authService.api.put(
        `/admin/solicitud/${selectedSolicitud._id}`,
        {
          estado,
          comentarios,
          preciosPorNino: precios,
          precioTotal: calcularPrecioTotal()
        }
      );
      
      if (response.data) {
        // Actualizar la lista
        setSolicitudes(solicitudes.map(sol => 
          sol._id === selectedSolicitud._id ? { 
            ...sol, 
            estado, 
            comentarios,
            preciosPorNino: precios,
            precioTotal: calcularPrecioTotal(),
            fechaRespuesta: new Date()
          } : sol
        ));
        
        setSelectedSolicitud(null);
        setComentarios('');
        toast.success(`Solicitud ${estado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente`);
      }
    } catch (error) {
      console.error('Error al actualizar solicitud:', error);
      toast.error('Error al procesar la solicitud');
    }
  };
  
  const solicitudesFiltradas = solicitudes.filter(sol => {
    // Filtro por estado
    const pasaFiltroEstado = filtroPor === 'todas' || sol.estado === filtroPor;
    
    // Filtro por escuela
    const pasaFiltroEscuela = escuelaSeleccionada === 'todas' || 
                            (sol.escuelaId && sol.escuelaId._id === escuelaSeleccionada);
    
    return pasaFiltroEstado && pasaFiltroEscuela;
  });
  
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 
                    dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {/*escuelaId && (
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <FaArrowLeft />
              <span>Volver al panel</span>
            </button>
          )*/}
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {escuelaId ? 'Solicitudes de esta Escuela' : 'Todas las Solicitudes de Inscripción'}
          </h1>
          
          <button
            onClick={() => setShowQrScanner(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <FaQrcode />
            <span>Escanear QR</span>
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrar por estado
              </label>
              <select
                value={filtroPor}
                onChange={(e) => setFiltroPor(e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 
                           px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas las solicitudes</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
            
            {!escuelaId && escuelasFiltro.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filtrar por escuela
                </label>
                <select
                  value={escuelaSeleccionada}
                  onChange={(e) => setEscuelaSeleccionada(e.target.value)}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 
                             px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todas">Todas las escuelas</option>
                  {escuelasFiltro.map(escuela => (
                    <option key={escuela._id} value={escuela._id}>
                      {escuela.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Escuela
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jugadores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Cargando solicitudes...</p>
                    </td>
                  </tr>
                ) : solicitudesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay solicitudes que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  solicitudesFiltradas.map(solicitud => (
                    <tr key={solicitud._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {solicitud.tutorId?.nombre} {solicitud.tutorId?.apellidos || ""}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {solicitud.tutorId?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {solicitud.escuelaId?.nombre || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(solicitud.fechaSolicitud).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {solicitud.ninos.length} jugador(es)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                            solicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedSolicitud(solicitud)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Ver detalles"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          
                          {solicitud.estado === 'pendiente' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedSolicitud(solicitud);
                                  setComentarios('');
                                }}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                title="Aprobar solicitud"
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSolicitud(solicitud);
                                  setComentarios('');
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Rechazar solicitud"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal de Escáner QR */}
      {showQrScanner && (
        <QRScanner 
          onScanSuccess={handleQrScan} 
          onClose={() => setShowQrScanner(false)} 
        />
      )}
      
      {/* Modal de Detalles/Edición de Solicitud */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white flex justify-between">
              <h2 className="text-2xl font-bold">
                Solicitud de Inscripción
              </h2>
              <button
                onClick={() => {
                  setSelectedSolicitud(null);
                  setComentarios('');
                }}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Detalles de la Solicitud
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tutor:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedSolicitud.tutorId?.nombre} {selectedSolicitud.tutorId?.apellidos || ""}
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Escuela:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedSolicitud.escuelaId?.nombre || "N/A"}
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de solicitud:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedSolicitud.fechaSolicitud).toLocaleDateString()} 
                        {' - '}
                        {new Date(selectedSolicitud.fechaSolicitud).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estado:</p>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${selectedSolicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          selectedSolicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {selectedSolicitud.estado}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Comentarios para el tutor
                  </h3>
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Ingresa aquí cualquier comentario sobre la solicitud..."
                    className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Jugadores a inscribir
              </h3>
              
              {selectedSolicitud.ninos.map((nino, index) => {
                const precio = precios.find(p => p.ninoIndex === index)?.precio || 0;
                const esUniforme = precios.find(p => p.ninoIndex === index)?.esUniforme || false;
                
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex flex-wrap justify-between items-start">
                      <div className="mb-4 md:mb-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {nino.nombre} {nino.apellidoPaterno} {nino.apellidoMaterno}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          CURP: {nino.claveCURP || 'No proporcionado'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fecha de nacimiento: {new Date(nino.fechaNacimiento).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Género: {nino.genero}
                        </p>
                      </div>
                      
                      {selectedSolicitud.estado === 'pendiente' && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Precio:
                            </span>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                $
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="50"
                                value={precio}
                                onChange={(e) => handlePrecioChange(index, e.target.value)}
                                className="pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-blue-500 focus:border-blue-500 w-32"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              id={`uniforme-${index}`}
                              type="checkbox"
                              checked={esUniforme}
                              onChange={(e) => handleUniformeChange(index, e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`uniforme-${index}`}
                              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Incluye uniforme
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {selectedSolicitud.estado !== 'pendiente' && (
                        <div>
                          {nino.precio && (
                            <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 
                                          px-3 py-2 rounded-lg text-sm font-medium">
                              ${nino.precio.toFixed(2)} MXN
                            </div>
                          )}
                          {nino.esUniforme && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Incluye uniforme
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {selectedSolicitud.estado === 'pendiente' && (
                <div className="flex justify-between items-center mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Precio Total:
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${calcularPrecioTotal().toFixed(2)} MXN
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => actualizarEstadoSolicitud('rechazada')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                    >
                      <FaTimes />
                      <span>Rechazar</span>
                    </button>
                    <button
                      onClick={() => actualizarEstadoSolicitud('aprobada')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                    >
                      <FaCheck />
                      <span>Aprobar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedSolicitud(null);
                  setComentarios('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudesInscripcion;
