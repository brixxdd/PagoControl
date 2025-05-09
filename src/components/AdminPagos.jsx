import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { FaSearch, FaMoneyBillWave, FaQrcode, FaCalendarAlt, FaUserAlt } from 'react-icons/fa';
import QRScanner from './QRScanner';
import { handlePagoQrScan } from '../utils/qrHandlers';
import { alertaError, alertaExito } from './Alert';

const AdminPagos = () => {
  const { escuelaId } = useParams();
  const [loading, setLoading] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [filtroTutor, setFiltroTutor] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [reporteData, setReporteData] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  
  useEffect(() => {
    cargarDatos();
  }, [escuelaId]);
  
  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Obtener pagos
      const pagosResponse = await authService.api.get(`api/admin/pagos?escuelaId=${escuelaId}`);
      setPagos(pagosResponse.data);
      
      // Obtener solicitudes pendientes
      const solicitudesResponse = await authService.api.get(`api/admin/solicitudes-pago?escuelaId=${escuelaId}&estado=pendiente`);
      setSolicitudes(solicitudesResponse.data);
      
      // Obtener tutores
      const tutoresResponse = await authService.api.get(`api/admin/tutores?escuelaId=${escuelaId}`);
      setTutores(tutoresResponse.data);
    } catch (error) {
      toast.error('Error al cargar datos de pagos');
    } finally {
      setLoading(false);
    }
  };
  
  const filtrarPagos = () => {
    let pagosFiltrados = [...pagos];
    
    if (filtroTutor) {
      pagosFiltrados = pagosFiltrados.filter(pago => 
        pago.tutorId?._id === filtroTutor || 
        pago.tutorId === filtroTutor
      );
    }
    
    if (filtroPeriodo) {
      const [mes, año] = filtroPeriodo.split('-');
      pagosFiltrados = pagosFiltrados.filter(pago => 
        pago.periodoPago && 
        pago.periodoPago.mes === parseInt(mes) && 
        pago.periodoPago.ano === parseInt(año)
      );
    }
    
    return pagosFiltrados;
  };
  
  const obtenerNombreMes = (mes) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Deptiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
  };
  
  const generarReporte = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const mes = now.getMonth() + 1;
      const año = now.getFullYear();
      
      const response = await authService.api.get(
        `api/admin/reporte-pagos?escuelaId=${escuelaId}&mes=${mes}&ano=${año}`
      );
      
      setReporteData(response.data);
    } catch (error) {
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };
  
  const handleQrScanSuccess = async (qrData) => {
    try {
      setShowQrScanner(false);
      
      // Usar la función específica para manejar el escaneo de pagos
      const solicitud = await handlePagoQrScan(qrData, escuelaId, authService,setSolicitudSeleccionada);
      
      // Guardar la solicitud seleccionada para mostrarla en un modal
      //setSolicitudSeleccionada(solicitud);
      //alertaExito('Solicitud de pago escaneada correctamente');
    } catch (error) {
      console.error('Error al procesar código QR:', error);
      alertaError(error.message || 'Error al procesar la solicitud de pago');
    }
  };
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
          
          <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
            <button
              onClick={() => setShowQrScanner(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <FaQrcode /> Escanear QR
            </button>
            
            <button
              onClick={generarReporte}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
            >
              <FaMoneyBillWave /> Generar Reporte
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Solicitudes pendientes */}
            {solicitudes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Solicitudes de Pago Pendientes ({solicitudes.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {solicitudes.map((solicitud) => (
                    <div key={solicitud._id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {solicitud.tutorId?.nombre || 'Tutor'} {solicitud.tutorId?.apellidos || ''}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Fecha: {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                          </p>
                          <p className="text-sm mt-1">
                            Niños: {solicitud.ninos.length}
                          </p>
                        </div>
                        <button
                          onClick={() => window.location.href = `/escuela/${escuelaId}/admin/procesar-pago/${solicitud._id}`}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                        >
                          Procesar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Filtros y tabla de pagos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Filtrar por tutor</label>
                  <select
                    value={filtroTutor}
                    onChange={(e) => setFiltroTutor(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Todos los tutores</option>
                    {tutores.map((tutor) => (
                      <option key={tutor._id} value={tutor._id}>
                        {tutor.nombre} {tutor.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Filtrar por periodo</label>
                  <select
                    value={filtroPeriodo}
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Todos los periodos</option>
                    {/* Generar periodos de los últimos 12 meses */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const mes = date.getMonth() + 1;
                      const año = date.getFullYear();
                      return (
                        <option key={`${mes}-${año}`} value={`${mes}-${año}`}>
                          {obtenerNombreMes(mes)} {año}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Niño
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Periodo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtrarPagos().length > 0 ? (
                      filtrarPagos().map((pago) => (
                        <tr key={pago._id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {new Date(pago.fechaPago).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {pago.tutorId?.nombre || 'N/A'} {pago.tutorId?.apellidos || ''}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {pago.ninoId?.nombre || 'N/A'} {pago.ninoId?.apellidoPaterno || ''}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">
                            {pago.concepto}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            ${pago.monto.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {pago.periodoPago ? (
                              `${obtenerNombreMes(pago.periodoPago.mes)} ${pago.periodoPago.ano}`
                            ) : 'N/A'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <button
                              onClick={() => window.location.href = `/escuela/${escuelaId}/admin/ver-pago/${pago._id}`}
                              className="text-blue-500 hover:underline"
                            >
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No se encontraron pagos con los filtros seleccionados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Reporte de pagos */}
            {reporteData && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Reporte de Pagos - {obtenerNombreMes(reporteData.mes)} {reporteData.ano}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800">Total Recaudado</h3>
                    <p className="text-2xl font-bold text-blue-600">${reporteData.totalRecaudado.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800">Pagos Completados</h3>
                    <p className="text-2xl font-bold text-green-600">{reporteData.pagosCompletados}</p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-red-800">Pagos Pendientes</h3>
                    <p className="text-2xl font-bold text-red-600">{reporteData.pagosPendientes}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-3">Detalle de Pagos Pendientes</h3>
                
                {reporteData.detallesPendientes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tutor
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Niño
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto Pendiente
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteData.detallesPendientes.map((pendiente, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {pendiente.tutorNombre}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {pendiente.ninoNombre}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              ${pendiente.montoPendiente.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <button
                                onClick={() => window.location.href = `/escuela/${escuelaId}/admin/recordatorio/${pendiente.tutorId}`}
                                className="text-blue-500 hover:underline"
                              >
                                Enviar recordatorio
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    No hay pagos pendientes en este período
                  </p>
                )}
              </div>
            )}
            
            {/* Scanner de QR */}
            {showQrScanner && (
              <QRScanner 
                onScanSuccess={handleQrScanSuccess} 
                onClose={() => setShowQrScanner(false)} 
              />
            )}
            
            {/* Modal para mostrar la solicitud escaneada */}
            {solicitudSeleccionada && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Procesar Pago
                    </h2>
                    <button 
                      onClick={() => setSolicitudSeleccionada(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tutor:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {solicitudSeleccionada.tutorId?.nombre} {solicitudSeleccionada.tutorId?.apellidos || ""}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Periodo de Pago:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {solicitudSeleccionada.periodoPago ? 
                        (() => {
                          const fechaInicio = new Date(solicitudSeleccionada.periodoPago.fechaInicio);
                          const mes = fechaInicio.getMonth() + 1;
                          const ano = fechaInicio.getFullYear();
                          return `${obtenerNombreMes(mes)} ${ano}`;
                        })() : 
                        'No especificado'}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Niños:</p>
                    <ul className="mt-2 space-y-2">
                      {solicitudSeleccionada.ninos?.map((nino, index) => (
                        <li key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {nino.nombre} {nino.apellidoPaterno} {nino.apellidoMaterno}
                          </p>
                          {nino.precio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Precio: ${nino.precio.toFixed(2)}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setSolicitudSeleccionada(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // Redirigir a la página de procesamiento de pago
                        window.location.href = `/escuela/${escuelaId}/admin/procesar-pago/${solicitudSeleccionada._id}`;
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Procesar Pago
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPagos;
