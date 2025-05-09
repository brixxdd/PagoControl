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