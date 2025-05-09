/**
 * Determina el próximo período de pago según la fecha actual
 * @returns {Object} Objeto con fechaInicio y fechaFin del período
 */
const determinarProximoPeriodoPago = () => {
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth();
  const año = fechaActual.getFullYear();
  
  let fechaInicio, fechaFin;
  
  // Si estamos entre el 1 y el 5, el periodo es el actual
  if (dia <= 5) {
    fechaInicio = new Date(año, mes, 1);
    fechaFin = new Date(año, mes, 5);
  } 
  // Si estamos entre el 6 y el 14, el periodo es del 15 al 20
  else if (dia <= 14) {
    fechaInicio = new Date(año, mes, 15);
    fechaFin = new Date(año, mes, 20);
  }
  // Si estamos entre el 15 y el 20, el periodo es el actual
  else if (dia <= 20) {
    fechaInicio = new Date(año, mes, 15);
    fechaFin = new Date(año, mes, 20);
  }
  // Si estamos después del 20, el periodo es del 1 al 5 del próximo mes
  else {
    const siguienteMes = mes === 11 ? 0 : mes + 1;
    const siguienteAño = mes === 11 ? año + 1 : año;
    fechaInicio = new Date(siguienteAño, siguienteMes, 1);
    fechaFin = new Date(siguienteAño, siguienteMes, 5);
  }
  
  return { fechaInicio, fechaFin };
};

/**
 * Determina la fecha de próximo pago para un nuevo inscrito
 * @param {Date} fechaInscripcion - Fecha en que se aprobó la inscripción 
 * @returns {Object} Objeto con fechaInicio y fechaFin del período de pago
 */
const determinarPrimerPeriodoPago = (fechaInscripcion) => {
  const dia = fechaInscripcion.getDate();
  const mes = fechaInscripcion.getMonth();
  const año = fechaInscripcion.getFullYear();
  
  let fechaInicio, fechaFin;
  
  // Si la inscripción es antes del 15, el primer pago es del 15 al 20
  if (dia < 15) {
    fechaInicio = new Date(año, mes, 15);
    fechaFin = new Date(año, mes, 20);
  } 
  // Si la inscripción es después del 15, el primer pago es del 1 al 5 del próximo mes
  else {
    const siguienteMes = mes === 11 ? 0 : mes + 1;
    const siguienteAño = mes === 11 ? año + 1 : año;
    fechaInicio = new Date(siguienteAño, siguienteMes, 1);
    fechaFin = new Date(siguienteAño, siguienteMes, 5);
  }
  
  return { fechaInicio, fechaFin };
};

module.exports = {
  determinarProximoPeriodoPago,
  determinarPrimerPeriodoPago
};
