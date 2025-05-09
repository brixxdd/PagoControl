const Nino = require('../models/Nino');
const Pago = require('../models/Pago');
const mongoose = require('mongoose');

/**
 * Actualiza los precios de mensualidad para todos los niños
 * basado en la cantidad de hermanos
 */
const actualizarPreciosMensualidad = async () => {
  try {
    // Obtener todos los tutores con niños
    const tutoresConNinos = await Nino.aggregate([
      {
        $group: {
          _id: {
            tutorId: '$tutorId',
            escuelaId: '$escuelaId'
          },
          ninos: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Para cada tutor, actualizar el precio de sus niños
    for (const grupo of tutoresConNinos) {
      const cantidadNinos = grupo.count;
      const precioMensualidad = cantidadNinos > 1 ? 200 : 250;
      
      // Actualizar precio para cada niño
      for (const nino of grupo.ninos) {
        await Nino.updateOne(
          { _id: nino._id },
          { $set: { precio: precioMensualidad } }
        );
      }
    }
    
    console.log(`Precios actualizados para ${tutoresConNinos.length} grupos familiares`);
    return true;
  } catch (error) {
    console.error('Error al actualizar precios de mensualidad:', error);
    return false;
  }
};

/**
 * Verifica y notifica pagos pendientes
 */
const verificarPagosPendientes = async () => {
  try {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anoActual = fechaActual.getFullYear();
    
    // Obtener todos los niños activos
    const ninos = await Nino.find().populate('tutorId').populate('escuelaId');
    
    // Verificar cada niño
    const pendientes = [];
    
    for (const nino of ninos) {
      // Buscar si tiene un pago para el mes actual
      const tienePago = await Pago.findOne({
        ninoId: nino._id,
        'periodoPago.mes': mesActual,
        'periodoPago.ano': anoActual,
        concepto: 'mensualidad'
      });
      
      if (!tienePago) {
        pendientes.push({
          ninoId: nino._id,
          ninoNombre: `${nino.nombre} ${nino.apellidoPaterno}`,
          tutorId: nino.tutorId._id,
          tutorNombre: `${nino.tutorId.nombre} ${nino.tutorId.apellidos}`,
          tutorEmail: nino.tutorId.email,
          escuelaId: nino.escuelaId._id,
          escuelaNombre: nino.escuelaId.nombre,
          precio: nino.precio
        });
      }
    }
    
    console.log(`Se encontraron ${pendientes.length} pagos pendientes`);
    return pendientes;
  } catch (error) {
    console.error('Error al verificar pagos pendientes:', error);
    return [];
  }
};

module.exports = {
  actualizarPreciosMensualidad,
  verificarPagosPendientes
};
