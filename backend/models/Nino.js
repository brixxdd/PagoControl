const mongoose = require('mongoose');

const ninoSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  tipoSangre: { type: String, required: true },
  alergias: { type: String, default: 'Ninguna' },
  edad: { type: Number, required: true },
  genero: { 
    type: String, 
    required: true,
    enum: ['Masculino', 'Femenino', 'Otro']
  },
  fechaNacimiento: { type: Date, required: true },
  tutorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutor',
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Nino', ninoSchema); 