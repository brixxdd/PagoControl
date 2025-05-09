const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
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
  ninoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nino',
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  concepto: {
    type: String,
    enum: ['mensualidad', 'inscripcion', 'uniforme', 'otro'],
    required: true
  },
  periodoPago: {
    mes: Number,
    ano: Number
  },
  fechaPago: {
    type: Date,
    default: Date.now
  },
  solicitudPagoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolicitudPago'
  },
  comprobante: String, // URL o datos del comprobante
  observaciones: String,
  procesadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor' // El admin que procesó el pago
  }
});

module.exports = mongoose.model('Pago', pagoSchema);
