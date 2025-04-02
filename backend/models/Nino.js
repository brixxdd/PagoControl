const mongoose = require('mongoose');

const ninoSchema = new mongoose.Schema({
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  nombre: { type: String, required: true },
  claveCURP: { type: String, required: true, unique: true },
  fechaNacimiento: { type: Date, required: true },
  tipoSangre: { type: String, required: true },
  lugarNacimiento: { type: String, required: true },
  estudios: { type: String, required: true },
  municipioResidencia: { type: String, required: true },
  codigoPostal: { type: String, required: true },
  numeroCamiseta: { type: String, required: true },
  alergias: { type: String, default: 'Ninguna' },
  cirugias: { type: String, default: 'Ninguna' },
  afecciones: { type: String, default: 'Ninguna' },
  nombrePadres: { type: String, required: true },
  telefonos: { type: String, required: true },
  tutorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutor',
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Nino', ninoSchema); 