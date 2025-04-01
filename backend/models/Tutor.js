const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String },
  isAdmin: { type: Boolean, default: false },
  numeroContacto: { type: String, default: '' },
  direccion: { type: String, default: '' },
  numeroEmergencia: { type: String, default: '' },
  registroCompleto: { type: Boolean, default: false },
  theme: {
    type: String,
    default: 'default',
    enum: ['default', 'purple', 'green', 'ocean', 'sunset']
  },
  darkMode: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tutor', tutorSchema); 