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
  genero: {
    type: String,
    required: true,
    enum: ['VARONIL', 'FEMENIL'],
    default: 'VARONIL'
  },
  categoria: {
    type: String,
    default: 'SIN-ASIGNAR',
    enum: [
      'PAÑALES-2010',
      'MICRO-2014-15',
      'INFANTIL-2012-13',
      'PASARELA-2014-15',
      'CADETE-2016-17',
      'SIN-ASIGNAR'
    ]
  },
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

// Middleware pre-save para asignar automáticamente la categoría según fecha de nacimiento
ninoSchema.pre('save', function(next) {
  const fechaNacimiento = new Date(this.fechaNacimiento);
  const yearNacimiento = fechaNacimiento.getFullYear();
  
  // Asignar categoría según año de nacimiento
  if (yearNacimiento === 2010) {
    this.categoria = 'PAÑALES-2010';
  } else if (yearNacimiento === 2014 || yearNacimiento === 2015) {
    if (this.genero === 'FEMENIL') {
      this.categoria = 'PASARELA-2014-15';
    } else {
      this.categoria = 'MICRO-2014-15';
    }
  } else if (yearNacimiento === 2012 || yearNacimiento === 2013) {
    this.categoria = 'INFANTIL-2012-13';
  } else if (yearNacimiento === 2016 || yearNacimiento === 2017) {
    this.categoria = 'CADETE-2016-17';
  } else {
    // Si no coincide con ninguna categoría, asignar una por defecto
    this.categoria = 'SIN-ASIGNAR';
  }
  
  next();
});

module.exports = mongoose.model('Nino', ninoSchema);