// models/Escuela.js
const mongoose = require('mongoose');

const escuelaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  identificador: { type: String, required: true, unique: true },
  logoUrl: { type: String },
  direccion: { type: String },
  diasEntrenamiento: { 
    type: [String], 
    default: ['Martes', 'Jueves'] 
  },
  mision: { type: String, defaul: 'No hay mision para mostrar.' },
  vision: { type: String, default: 'No hay vision para mostrar.' },
  tema: {
    colores: {
      primario: { type: String, default: '#3B82F6' },
      secundario: { type: String, default: '#6366F1' },
      texto: { type: String, default: '#1F2937' },
      fondo: { type: String, default: '#F9FAFB' },
      fondoSecundario: { type: String, default: '#F3F4F6' },
      borde: { type: String, default: '#E5E7EB' },
      error: { type: String, default: '#EF4444' },
      exito: { type: String, default: '#10B981' },
      advertencia: { type: String, default: '#F59E0B' },
      info: { type: String, default: '#3B82F6' }
    },
    tipografia: {
      fuente: { type: String, default: "'Roboto', sans-serif" },
      titulos: { type: String, default: "'Montserrat', sans-serif" },
      tamanioBase: { type: String, default: "16px" }
    },
    componentes: {
      botones: {
        radio: { type: String, default: "0.375rem" },
        padding: { type: String, default: "0.75rem 1.5rem" },
        sombra: { type: String, default: "0 1px 2px rgba(0, 0, 0, 0.05)" }
      },
      tarjetas: {
        radio: { type: String, default: "0.5rem" },
        sombra: { type: String, default: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
        padding: { type: String, default: "1.5rem" }
      }
    },
    imagenes: {
      fondo: { type: String },
      patron: { type: String }
    }
  },
  fechaCreacion: { type: Date, default: Date.now },
  activa: { type: Boolean, default: true }
});

module.exports = mongoose.model('Escuela', escuelaSchema);