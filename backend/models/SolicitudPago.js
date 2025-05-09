const mongoose = require('mongoose');

const solicitudPagoSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  escuelaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escuela',
    required: true
  },
  ninos: [{
    ninoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nino',
      required: true
    },
    nombre: String,
    apellidoPaterno: String,
    monto: Number
  }],
  estado: {
    type: String,
    enum: ['pendiente', 'procesado', 'cancelado'],
    default: 'pendiente'
  },
  montoTotal: {
    type: Number,
    default: 0
  },
  periodoPago: {
    fechaInicio: Date,
    fechaFin: Date
  },
  observaciones: String,
  codigoQR: String,
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  fechaProcesamiento: Date
});

module.exports = mongoose.model('SolicitudPago', solicitudPagoSchema);