import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaChild, FaSave, FaTimes } from 'react-icons/fa';
import { alertaError, alertaExito } from './Alert';


const ProcesarPago = () => {
  const { escuelaId, solicitudId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [ninos, setNinos] = useState([]);
  const [ninosProcesados, setNinosProcesados] = useState({});
  const [observaciones, setObservaciones] = useState('');
  
  useEffect(() => {
    cargarSolicitud();
  }, [solicitudId]);
  
  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      
      // Cargar detalle de la solicitud
      const response = await authService.api.get(`api/admin/solicitud-pago/${solicitudId}`);
      setSolicitud(response.data);
      
      // Inicializar el estado para cada niño
      const ninosData = {};
      
      if (response.data.ninos) {
        // Verificar si los niños ya están aprobados
        const ninoIds = response.data.ninos
          .filter(n => n.ninoId)
          .map(n => n.ninoId);
        
        if (ninoIds.length > 0) {
          // Obtener datos completos de los niños
          const ninosResponse = await authService.api.get(`api/admin/ninos?ids=${ninoIds.join(',')}`);
          setNinos(ninosResponse.data);
          // Preparar datos iniciales de pago
          ninosResponse.data.forEach(nino => {
            ninosData[nino._id] = {
              monto: nino.precio || (nino.precio >= 0 ? nino.precio : 250),
              concepto: 'mensualidad',
              aplicaPago: true
            };
          });
        } else {
          // La solicitud tiene niños que no están aprobados aún
          toast.error('Esta solicitud contiene niños pendientes de aprobación');
        }
      }
      
      setNinosProcesados(ninosData);
    } catch (error) {
      console.error('Error al cargar solicitud:', error);
      toast.error('Error al cargar la solicitud de pago');
      navigate(`/escuela/${escuelaId}/admin/pagos`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMontoChange = (ninoId, value) => {
    setNinosProcesados(prev => ({
      ...prev,
      [ninoId]: {
        ...prev[ninoId],
        monto: parseFloat(value) || 0
      }
    }));
  };
  
  const handleConceptoChange = (ninoId, value) => {
    setNinosProcesados(prev => ({
      ...prev,
      [ninoId]: {
        ...prev[ninoId],
        concepto: value
      }
    }));
  };
  
  const handleAplicaPagoChange = (ninoId, checked) => {
    setNinosProcesados(prev => ({
      ...prev,
      [ninoId]: {
        ...prev[ninoId],
        aplicaPago: checked
      }
    }));
  };
  
  const calcularMontoTotal = () => {
    return Object.values(ninosProcesados)
      .filter(n => n.aplicaPago)
      .reduce((total, nino) => total + (nino.monto || 0), 0);
  };
  
  const procesarPago = async () => {
    try {
      setProcesando(true);
      
      // Preparar datos para el backend
      const pagosData = [];
      
      for (const ninoId in ninosProcesados) {
        if (ninosProcesados[ninoId].aplicaPago) {
          const nino = ninos.find(n => n._id === ninoId);
          
          if (nino) {
            // Obtener mes y año actual
            const now = new Date();
            const mes = now.getMonth() + 1;
            const ano = now.getFullYear();
            
            pagosData.push({
              ninoId,
              tutorId: solicitud.tutorId._id,
              escuelaId: solicitud.escuelaId._id,
              monto: ninosProcesados[ninoId].monto,
              concepto: ninosProcesados[ninoId].concepto,
              periodoPago: {
                mes,
                ano
              }
            });
          }
        }
      }
      
      // Enviar al backend
      const response = await authService.api.post('api/admin/procesar-pago', {
        solicitudPagoId: solicitudId,
        pagos: pagosData,
        observaciones,
        montoTotal: calcularMontoTotal()
      });
      
      toast.success('Pago procesado correctamente');
      alertaExito('Pago procesado correctamente')
      
      // Redireccionar a la página de gestión de pagos
      navigate(`/escuela/${escuelaId}/admin/pagos`);
    } catch (error) {
      console.error('Error al procesar pago:', error);
      toast.error('Error al procesar el pago');
      alertaError('Error al procesar el pago')
    } finally {
      setProcesando(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!solicitud) {
    return (
      <div className="p-6 text-center">
        <p className="text-xl text-gray-600">No se encontró la solicitud</p>
        <button
          onClick={() => navigate(`/escuela/${escuelaId}/admin/pagos`)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Volver a Pagos
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Procesar Pago</h1>
          
          <button
            onClick={() => navigate(`/escuela/${escuelaId}/admin/pagos`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes /> Cancelar
          </button>
        </div>
        
        {/* Información del tutor */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Información del Tutor</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Nombre:</p>
              <p className="font-medium">{solicitud.tutorId.nombre} {solicitud.tutorId.apellidos}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Email:</p>
              <p className="font-medium">{solicitud.tutorId.email}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Teléfono:</p>
              <p className="font-medium">{solicitud.tutorId.numeroContacto || 'No disponible'}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Fecha de solicitud:</p>
              <p className="font-medium">{new Date(solicitud.fechaSolicitud).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Niños y montos */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Detalles del Pago</h2>
          
          {ninos.length > 0 ? (
            <div className="space-y-6">
              {ninos.map((nino) => (
                <div key={nino._id} className="border p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FaChild className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{nino.nombre} {nino.apellidoPaterno}</h3>
                        <p className="text-sm text-gray-500">CURP: {nino.claveCURP || 'No disponible'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          id={`aplicaPago-${nino._id}`}
                          checked={ninosProcesados[nino._id]?.aplicaPago}
                          onChange={(e) => handleAplicaPagoChange(nino._id, e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor={`aplicaPago-${nino._id}`} className="text-sm">
                          Aplicar pago
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {ninosProcesados[nino._id]?.aplicaPago && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Concepto
                        </label>
                        <select
                          value={ninosProcesados[nino._id]?.concepto}
                          onChange={(e) => handleConceptoChange(nino._id, e.target.value)}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="mensualidad">Mensualidad</option>
                          <option value="inscripcion">Inscripción</option>
                          <option value="uniforme">Uniforme</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Monto
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            value={ninosProcesados[nino._id]?.monto}
                            onChange={(e) => handleMontoChange(nino._id, e.target.value)}
                            className="w-full pl-8 p-2 border rounded-lg"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Observaciones */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-1">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  placeholder="Agregar notas o comentarios sobre el pago..."
                ></textarea>
              </div>
              
              {/* Total */}
              <div className="mt-6 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-lg font-medium">Total a pagar:</span>
                <span className="text-xl font-bold">${calcularMontoTotal().toFixed(2)}</span>
              </div>
              
              {/* Botón de procesar */}
              <button
                onClick={procesarPago}
                disabled={procesando || calcularMontoTotal() < 0}
                className={`mt-6 w-full py-3 rounded-lg flex items-center justify-center gap-2 
                           ${procesando || calcularMontoTotal() < 0 
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                           : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                <FaMoneyBillWave />
                {procesando ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No hay niños inscritos para procesar el pago</p>
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

export default ProcesarPago;
