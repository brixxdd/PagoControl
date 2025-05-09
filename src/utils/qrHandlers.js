import { toast } from 'react-toastify';
import { alertaError, alertaExito } from '../components/Alert';

export const handleAdminScanSuccess = (qrData) => {
  // Lógica específica para el escaneo en el contexto del administrador
  console.log("Escaneo en Admin:", qrData);
  // Manejo específico para el admin
};

export const handleSchoolScanSuccess = (qrData) => {
  // Lógica específica para el escaneo en el contexto de la escuela
  console.log("Escaneo en Escuela:", qrData);
  // Manejo específico para la escuela
};

export const handleQrScan = (qrData, solicitudes, setSelectedSolicitud, setShowQrScanner, fetchSolicitudById) => {
  try {
    console.log("Escaneo en principal por Admin:");
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
      console.log('PRINCIPAL - Buscando peticion en las solicitudes')
      setSelectedSolicitud(found);
      //setShowQrScanner(false);
    } else {
      console.log('PRINCIPAL - Buscando peticion por servidor')
      const response = fetchSolicitudById(id);
      if (response.data) {
        setSelectedSolicitud(response.data);
      }
      
    }
    setShowQrScanner(false);
  } catch (error) {
    console.error('Error al procesar QR:', error);
    //toast.error('Código QR inválido');
    alertaError('Codigo QR invalido.');
  }
};

export const handleQrScanScholl = async (qrData, solicitudes, setSelectedSolicitud, setShowQrScanner, fetchSolicitudById, escuelaSeleccionada) => {
    try {
        console.log("Escaneo en portal de escuela por Admin:");
        // 1) Extraer el ID de la solicitud del código QR
        const raw = qrData.solicitudId || qrData; 
        const decoded = decodeURIComponent(raw);
        let id;
        try {
            id = new URL(decoded).pathname.split('/').pop();
        } catch {
            id = decoded;
        }

        // 2) Buscar la solicitud en las solicitudes cargadas
        const found = solicitudes.find(s => s._id === id);
        
        if (found) {
            console.log('ESCUELA - Buscando peticion en las solicitudes')
            // 3) Verificar si la solicitud pertenece a la escuela actual
            if (found.escuelaId.identificador === escuelaSeleccionada) {
                console.log('ESCUELA - La solicitud SI pertenece a esta escuela');
                setSelectedSolicitud(found);
            } else {
                console.log('ESCUELA - La solicitud NO pertenece a esta escuela');
                alertaError('No puedes acceder a solicitudes de otras escuelas desde este portal.');
            }
            
        } else {
            console.log('ESCUELA - buscar solicitud por servidor');
            const response = await fetchSolicitudById(id); // Espera la respuesta
            if (response && response.escuelaId.identificador === escuelaSeleccionada) {
                setSelectedSolicitud(response);
            } else {
                alertaError('La solicitud no pertenece a esta escuela.');
            }
        }
        setShowQrScanner(false);
    } catch (error) {
        console.error('Error al procesar QR:', error);
        alertaError('Código QR inválido.');
    }
};

export const handlePagoQrScan = async (qrData, escuelaId, authService, setSolicitudSeleccionada) => {
  try {
    console.log("Escaneo de pago por Admin:", qrData);
    
    // 1) Extraer el ID de la solicitud del código QR
    const raw = qrData.solicitudId || qrData; 
    const decoded = decodeURIComponent(raw);
    let solicitudId;
    try {
        solicitudId = new URL(decoded).pathname.split('/').pop();
    } catch {
        solicitudId = decoded;
    }
    
    if (!solicitudId || solicitudId.length !== 24) {
      throw new Error('ID de solicitud inválido');
    }
    
    // 2) Obtener la solicitud de pago
    const response = await authService.api.get(`/api/admin/solicitud-pago/${solicitudId}`);
    
    // 3) Verificar que pertenezca a la escuela actual
    if (response.data && response.data.escuelaId) {
      const solicitudEscuelaId = 
        typeof response.data.escuelaId === 'object' ? 
        response.data.escuelaId._id || response.data.escuelaId.identificador : 
        response.data.escuelaId;
      
      if (solicitudEscuelaId !== escuelaId && response.data.escuelaId.identificador !== escuelaId) {
        alertaError('La solicitud no pertenece a esta escuela');
      }else{
        setSolicitudSeleccionada(response.data);
        alertaExito('Solicitud de pago escaneada correctamente');
      }
    } else {
      throw new Error('Formato de respuesta inválido');
    }
  } catch (error) {
    console.error('Error al procesar QR:', error);
    alertaError(
      error.response?.data?.message 
        || 'Error al procesar QR'
    );
  }
  
};