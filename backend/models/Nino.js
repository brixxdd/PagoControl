const mongoose = require('mongoose');

const ninoSchema = new mongoose.Schema({
  apellidoPaterno: { 
    type: String, 
    required: true,
    set: v => v.toUpperCase() 
  },
  apellidoMaterno: { 
    type: String, 
    required: true,
    set: v => v.toUpperCase() 
  },
  nombre: { 
    type: String, 
    required: true,
    set: v => v.toUpperCase() 
  },
  claveCURP: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{18}$/.test(v);
      },
      message: 'La CURP debe tener exactamente 18 caracteres alfanuméricos'
    },
    set: v => v.toUpperCase()
  },
  fechaNacimiento: { type: Date, required: true },
  tipoSangre: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  estado: {
    type: String,
    required: true,
    set: v => v.toUpperCase()
  },
  municipioResidencia: { 
    type: String, 
    required: true,
    set: v => v.toUpperCase()
  },
  codigoPostal: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{5}$/.test(v);
      },
      message: 'El código postal debe tener 5 dígitos'
    }
  },
  numeroCamiseta: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{1,2}$/.test(v);
      },
      message: 'El número de camiseta debe ser entre 0 y 99'
    }
  },
  alergias: { 
    type: String, 
    default: 'NINGUNA',
    set: v => v.toUpperCase()
  },
  cirugias: { 
    type: String, 
    default: 'NINGUNA',
    set: v => v.toUpperCase()
  },
  afecciones: { 
    type: String, 
    default: 'NINGUNA',
    set: v => v.toUpperCase()
  },
  nombrePadres: { 
    type: String, 
    required: true,
    set: v => v.toUpperCase()
  },
  telefonos: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'El teléfono debe tener 10 dígitos'
    }
  },
  tutorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutor',
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Nino', ninoSchema);