import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaTshirt, FaRunning, FaUsers, FaQrcode, FaClipboardList, FaChild, FaChartBar } from 'react-icons/fa';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const AdminEscuelaDashboard = () => {
  const { escuelaId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [escuela, setEscuela] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalNinos: 0,
    totalTutores: 0,
    pagosCompletados: 0,
    pagosPendientes: 0,
    recaudacionMensual: 0,
    solicitudesPendientes: 0
  });
  const [solicitudes, setSolicitudes] = useState([]);
  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de la escuela
        const escuelaResponse = await authService.api.get(`/api/escuelas/${escuelaId}`);
        setEscuela(escuelaResponse.data);
        
        // Obtener estadísticas
        const estadisticasResponse = await authService.api.get(`/admin/estadisticas-escuela?escuelaId=${escuelaId}`);
        setEstadisticas(estadisticasResponse.data);
        
        // Obtener solicitudes pendientes
        const solicitudesResponse = await authService.api.get(`/admin/solicitudes-pago?escuelaId=${escuelaId}&estado=pendiente`);
        setSolicitudes(solicitudesResponse.data.slice(0, 5)); // Solo mostrar las 5 más recientes
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [escuelaId]);
  
  // Calcular fechas de pago
  const fechasPago = useMemo(() => {
    const fechaActual = new Date();
    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();
    
    return {
      primerPeriodo: `1-5 de ${new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(año, mes))}`,
      segundoPeriodo: `15-20 de ${new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(año, mes))}`
    };
  }, []);
  
  // Información de cuotas
  const infoCuotas = {
    unNino: '250 MXN',
    dosOMas: '200 MXN por niño',
    uniforme: '650 MXN por niño (solo nuevos)'
  };
  
  const handleVerSolicitud = (solicitudId) => {
    navigate(`/admin/solicitud-pago/${solicitudId}`);
  };
  
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!escuela) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Escuela no encontrada</h2>
          <p className="text-gray-600">La escuela solicitada no existe o no tienes permisos para verla.</p>
          <Link to="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Componentes con clases de Tailwind
  const Card = ({ children, className = "", ...props }) => {
    return (
      <div
        className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700">
            Dashboard Administrativo - {escuela.nombre}
          </h2>
          
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Volver al Dashboard
          </Link>
        </div>
        
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Niños</p>
                <p className="text-3xl font-bold mt-1">{estadisticas.totalNinos}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <FaChild className="text-blue-700 text-xl" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Tutores</p>
                <p className="text-3xl font-bold mt-1">{estadisticas.totalTutores}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <FaUsers className="text-green-700 text-xl" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Recaudación Mensual</p>
                <p className="text-3xl font-bold mt-1">${estadisticas.recaudacionMensual.toFixed(2)}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <FaMoneyBillWave className="text-purple-700 text-xl" />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="flex flex-col h-full">
            <h3 className="font-semibold mb-4 flex items-center text-orange-600">
              <FaQrcode className="mr-2" /> Solicitudes Pendientes
            </h3>
            <div className="text-3xl font-bold">{estadisticas.solicitudesPendientes}</div>
            <div className="mt-4 text-sm">
              <Link to={`/admin/solicitudes-pago/${escuelaId}`} className="text-blue-600 hover:underline">
                Ver todas las solicitudes
              </Link>
            </div>
          </Card>
          
          <Card className="flex flex-col h-full">
            <h3 className="font-semibold mb-4 flex items-center text-green-600">
              <FaClipboardList className="mr-2" /> Pagos Completados
            </h3>
            <div className="text-3xl font-bold">{estadisticas.pagosCompletados}</div>
            <div className="mt-4 text-sm">
              <Link to={`/admin/pagos/${escuelaId}`} className="text-blue-600 hover:underline">
                Ver todos los pagos
              </Link>
            </div>
          </Card>
          
          <Card className="flex flex-col h-full">
            <h3 className="font-semibold mb-4 flex items-center text-red-600">
              <FaClipboardList className="mr-2" /> Pagos Pendientes
            </h3>
            <div className="text-3xl font-bold">{estadisticas.pagosPendientes}</div>
            <div className="mt-4 text-sm">
              <Link to={`/admin/reporte-pagos/${escuelaId}`} className="text-blue-600 hover:underline">
                Generar reporte
              </Link>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Solicitudes recientes */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaQrcode className="mr-2 text-blue-600" /> 
              Solicitudes de Pago Recientes
            </h3>
            
            {solicitudes.length > 0 ? (
              <div className="space-y-3">
                {solicitudes.map(solicitud => (
                  <div key={solicitud._id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {solicitud.tutorId?.nombre} {solicitud.tutorId?.apellidos}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatearFecha(solicitud.fechaSolicitud)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {solicitud.ninos.length} niños
                        </p>
                      </div>
                      <button
                        onClick={() => handleVerSolicitud(solicitud._id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 text-center">
                  <Link 
                    to={`/admin/solicitudes-pago/${escuelaId}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver todas las solicitudes
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay solicitudes pendientes
              </div>
            )}
          </Card>
          
          {/* Información de Fechas de Pago y Cuotas */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" /> 
              Información de Pagos
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Fechas de Pago</h4>
                <div className="space-y-1">
                  <p className="text-sm flex justify-between">
                    <span>Primer período:</span>
                    <span className="font-medium">{fechasPago.primerPeriodo}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Segundo período:</span>
                    <span className="font-medium">{fechasPago.segundoPeriodo}</span>
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Cuotas Establecidas</h4>
                <div className="space-y-1">
                  <p className="text-sm flex justify-between">
                    <span>1 niño:</span>
                    <span className="font-medium">{infoCuotas.unNino}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>2 o más niños:</span>
                    <span className="font-medium">{infoCuotas.dosOMas}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Uniforme:</span>
                    <span className="font-medium">{infoCuotas.uniforme}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Link 
                to={`/admin/configuracion/${escuelaId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Configurar valores
              </Link>
            </div>
          </Card>
        </div>
        
        {/* Acciones administrativas */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Acciones administrativas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link 
              to={`/admin/scanner/${escuelaId}`}
              className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaQrcode className="text-2xl mb-2" />
              <span>Escanear QR</span>
            </Link>
            
            <Link 
              to={`/admin/pagos/${escuelaId}`}
              className="flex flex-col items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaMoneyBillWave className="text-2xl mb-2" />
              <span>Gestionar Pagos</span>
            </Link>
            
            <Link 
              to={`/admin/ninos/${escuelaId}`}
              className="flex flex-col items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaChild className="text-2xl mb-2" />
              <span>Ver Niños</span>
            </Link>
            
            <Link 
              to={`/admin/reportes/${escuelaId}`}
              className="flex flex-col items-center justify-center p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FaChartBar className="text-2xl mb-2" />
              <span>Reportes</span>
            </Link>
          </div>
        </div>
        
        {/* Información institucional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Datos de la Escuela</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                {escuela.logoUrl && (
                  <img 
                    src={escuela.logoUrl} 
                    alt={`Logo de ${escuela.nombre}`} 
                    className="w-16 h-16 object-contain mr-4"
                  />
                )}
                <div>
                  <h4 className="font-medium">{escuela.nombre}</h4>
                  {escuela.direccion && (
                    <p className="text-sm text-gray-600">{escuela.direccion}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Misión</h4>
                <p className="text-sm">{escuela.mision || 'No especificada'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Visión</h4>
                <p className="text-sm">{escuela.vision || 'No especificada'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Días de entrenamiento</h4>
                <p className="text-sm">
                  {escuela.diasEntrenamiento?.length 
                    ? escuela.diasEntrenamiento.join(' y ') 
                    : 'No especificados'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Administradores</h4>
                <div className="space-y-2">
                  {/* Aquí podrías listar los administradores de la escuela */}
                  <p className="text-sm flex justify-between">
                    <span>Admin Principal</span>
                    <span className="font-medium">admin@escuela.com</span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Datos de contacto</h4>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between">
                    <span>Teléfono:</span>
                    <span className="font-medium">{escuela.telefono || 'No especificado'}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{escuela.email || 'No especificado'}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Sitio web:</span>
                    <span className="font-medium">
                      {escuela.sitioWeb ? (
                        <a href={escuela.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {escuela.sitioWeb}
                        </a>
                      ) : 'No especificado'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="mt-auto pt-4">
                <Link 
                  to={`/admin/editar-escuela/${escuelaId}`}
                  className="w-full block text-center py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Editar información
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminEscuelaDashboard;
