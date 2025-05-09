import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { FaQrcode, FaChild, FaMoneyBill } from 'react-icons/fa';

const SolicitudPago = () => {
  const { escuelaId } = useParams();
  const [loading, setLoading] = useState(false);
  const [ninos, setNinos] = useState([]);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [codigoQR, setCodigoQR] = useState('');
  const [periodosPago, setPeriodosPago] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  
  // Cargar niños inscritos al montar el componente
  useEffect(() => {
    cargarNinosInscritos();
    calcularPeriodosPago();
  }, [escuelaId]);
  
  const cargarNinosInscritos = async () => {
    try {
      setLoading(true);
      const response = await authService.api.get(`api/ninos-inscritos?escuelaId=${escuelaId}`);
      setNinos(response.data);
    } catch (error) {
      toast.error('Error al cargar niños inscritos');
    } finally {
      setLoading(false);
    }
  };
  
  const calcularPeriodosPago = () => {
    const fechaActual = new Date();
    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();
    
    // Determinar períodos disponibles
    const periodos = [];
    
    // Período del 1-5
    const inicio1 = new Date(año, mes, 1);
    const fin1 = new Date(año, mes, 5);
    periodos.push({
      id: `${mes+1}-${año}-1`,
      nombre: `Del 1 al 5 de ${obtenerNombreMes(mes)}`,
      fechaInicio: inicio1,
      fechaFin: fin1
    });
    
    // Período del 15-20
    const inicio2 = new Date(año, mes, 15);
    const fin2 = new Date(año, mes, 20);
    periodos.push({
      id: `${mes+1}-${año}-2`,
      nombre: `Del 15 al 20 de ${obtenerNombreMes(mes)}`,
      fechaInicio: inicio2,
      fechaFin: fin2
    });
    
    // Añadir siguiente mes si estamos cerca del fin de mes
    if (fechaActual.getDate() > 20) {
      const siguienteMes = (mes + 1) % 12;
      const siguienteAño = mes === 11 ? año + 1 : año;
      
      const inicio3 = new Date(siguienteAño, siguienteMes, 1);
      const fin3 = new Date(siguienteAño, siguienteMes, 5);
      periodos.push({
        id: `${siguienteMes+1}-${siguienteAño}-1`,
        nombre: `Del 1 al 5 de ${obtenerNombreMes(siguienteMes)}`,
        fechaInicio: inicio3,
        fechaFin: fin3
      });
    }
    
    setPeriodosPago(periodos);
    // Seleccionar período actual por defecto
    seleccionarPeriodoAutomatico(periodos, fechaActual);
  };
  
  const seleccionarPeriodoAutomatico = (periodos, fechaActual) => {
    for (const periodo of periodos) {
      if (fechaActual >= periodo.fechaInicio && fechaActual <= periodo.fechaFin) {
        setPeriodoSeleccionado(periodo.id);
        return;
      }
    }
    // Si no estamos en un período activo, seleccionar el siguiente disponible
    if (periodos.length > 0) {
      setPeriodoSeleccionado(periodos[0].id);
    }
  };
  
  const obtenerNombreMes = (mes) => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[mes];
  };
  
  const enviarSolicitudPago = async () => {
    if (!periodoSeleccionado) {
      toast.error('Selecciona un período de pago');
      return;
    }
    
    if (ninos.length === 0) {
      toast.error('No tienes niños inscritos en esta escuela');
      return;
    }
    
    try {
      setLoading(true);
      
      const periodoSeleccionadoObj = periodosPago.find(p => p.id === periodoSeleccionado);
      
      const solicitudData = {
        escuelaId,
        ninos: ninos.map(nino => ({
          ninoId: nino._id,
          nombre: nino.nombre,
          apellidoPaterno: nino.apellidoPaterno
        })),
        periodoPago: {
          fechaInicio: periodoSeleccionadoObj.fechaInicio,
          fechaFin: periodoSeleccionadoObj.fechaFin
        }
      };
      
      const response = await authService.api.post('/api/solicitud-pago', solicitudData);
      
      if (response.data && response.data.codigoQR) {
        setCodigoQR(response.data.codigoQR);
        setSolicitudEnviada(true);
        toast.success('Solicitud de pago generada correctamente');
      }
    } catch (error) {
      console.error('Error al enviar solicitud de pago:', error);
      toast.error(error.response?.data?.message || 'Error al generar la solicitud de pago');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Solicitud de Pago</h1>
        
        {solicitudEnviada ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
              ¡Solicitud de Pago Generada!
            </h2>
            <p className="mb-6">
              Muestra este código QR al administrador para realizar tu pago.
            </p>
            
            <div className="mb-6 flex justify-center">
              <img src={codigoQR} alt="Código QR de pago" className="w-64 h-64" />
            </div>
            
            <button
              onClick={() => setSolicitudEnviada(false)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg"
            >
              Generar Nueva Solicitud
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Niños Inscritos ({ninos.length})
            </h2>
            
            {ninos.length > 0 ? (
              <div className="space-y-4 mb-6">
                {ninos.map((nino) => (
                  <div key={nino._id} className="flex items-center p-3 border rounded-lg">
                    <FaChild className="text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">{nino.nombre} {nino.apellidoPaterno}</p>
                      <p className="text-sm text-gray-600">Mensualidad: ${nino.precio >= 0 ? nino.precio : '250'}</p>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Selecciona período de pago:
                  </label>
                  <select
                    value={periodoSeleccionado}
                    onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Selecciona un período</option>
                    {periodosPago.map((periodo) => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={enviarSolicitudPago}
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <FaQrcode />
                  {loading ? 'Generando...' : 'Generar Solicitud de Pago'}
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <FaMoneyBill className="mx-auto text-4xl text-gray-300 mb-3" />
                <p>No tienes niños inscritos en esta escuela.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudPago;
