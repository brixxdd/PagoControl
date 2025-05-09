const Nino = require('../models/Nino');
const Pago = require('../models/Pago');
const Tutor = require('../models/Tutor');
const Notification = require('../models/Notification');

/**
 * Envía notificaciones de recordatorio de pago a tutores
 */
const enviarRecordatoriosPago = async () => {
  try {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anoActual = fechaActual.getFullYear();
    const dia = fechaActual.getDate();
    
    // Definir periodo de pago según el día actual
    let periodoTexto;
    
    if ((dia >= 1 && dia <= 5) || (dia >= 15 && dia <= 20)) {
      periodoTexto = dia <= 5 ? 
        `del 1 al 5 de ${nombreMes(mesActual-1)}` : 
        `del 15 al 20 de ${nombreMes(mesActual-1)}`;
    } else {
      return; // No estamos en un periodo de pago, no enviar notificaciones
    }
    
    // Obtener niños con pago pendiente
    const ninos = await Nino.find().populate('tutorId');
    
    // Agrupar niños por tutor
    const ninosPorTutor = {};
    
    for (const nino of ninos) {
      // Verificar si tiene pago para el período actual
      const tienePago = await Pago.findOne({
        ninoId: nino._id,
        'periodoPago.mes': mesActual,
        'periodoPago.ano': anoActual,
        concepto: 'mensualidad'
      });
      
      if (!tienePago) {
        const tutorId = nino.tutorId._id.toString();
        if (!ninosPorTutor[tutorId]) {
          ninosPorTutor[tutorId] = {
            tutor: nino.tutorId,
            ninos: []
          };
        }
        
        ninosPorTutor[tutorId].ninos.push(nino);
      }
    }
    
    // Crear notificaciones para cada tutor
    for (const tutorId in ninosPorTutor) {
      const { tutor, ninos } = ninosPorTutor[tutorId];
      
      // Crear mensaje personalizado
      const mensaje = `Recordatorio de pago ${periodoTexto}. Tienes ${ninos.length} niño(s) con pago pendiente.`;
      
      // Crear notificación en la base de datos
      const notificacion = new Notification({
        tipo: 'pago',
        mensaje,
        destinatario: tutor._id,
        leida: false,
        enlace: '/solicitud-pago'
      });
      
      await notificacion.save();
      
      // Aquí se podría integrar con un servicio de correo electrónico
      // o SMS para enviar notificaciones externas
    }
    
    console.log(`Notificaciones enviadas a ${Object.keys(ninosPorTutor).length} tutores`);
    return Object.keys(ninosPorTutor).length;
  } catch (error) {
    console.error('Error al enviar recordatorios de pago:', error);
    return 0;
  }
};

/**
 * Obtiene el nombre del mes a partir del número (0-11)
 */
const nombreMes = (mes) => {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return meses[mes];
};

module.exports = {
  enviarRecordatoriosPago
};
