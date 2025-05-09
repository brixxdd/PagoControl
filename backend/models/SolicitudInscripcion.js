const mongoose = require('mongoose');
const Nino = require('./Nino'); // Asegúrate de importar el modelo Nino

const solicitudInscripcionSchema = new mongoose.Schema({
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
    // Datos temporales hasta que se apruebe la solicitud
    nombre: { type: String, required: true },
    apellidoPaterno: { type: String, required: true },
    apellidoMaterno: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    claveCURP: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^[A-Z0-9]{18}$/.test(v);
        },
        message: 'La CURP debe tener exactamente 18 caracteres alfanuméricos'
      }
    },
    genero: {
      type: String,
      required: true,
      enum: ['VARONIL', 'FEMENIL'],
      default: 'VARONIL'
    },
    tipoSangre: { 
      type: String, 
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    estado: {
      type: String,
      required: true
    },
    municipioResidencia: { 
      type: String, 
      required: true
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
      default: 'NINGUNA'
    },
    cirugias: { 
      type: String, 
      default: 'NINGUNA'
    },
    afecciones: { 
      type: String, 
      default: 'NINGUNA'
    },
    nombrePadres: { 
      type: String, 
      required: true
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
    ninoId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Nino' 
    }, // Se llena cuando se aprueba
  }],
  // Datos financieros que completará el admin
  preciosPorNino: [{
    ninoIndex: { type: Number, required: true },
    precio: { type: Number, required: true },
    esUniforme: { type: Boolean, default: false }
  }],
  precioTotal: { type: Number },
  fechaSolicitud: { type: Date, default: Date.now },
  estado: { 
    type: String, 
    enum: ['pendiente', 'aprobada', 'rechazada'], 
    default: 'pendiente' 
  },
  codigoQR: { type: String }, // URL del código QR generado
  observaciones: { type: String },
  fechaRespuesta: { type: Date }
}, {
  timestamps: true
});

// Middleware para verificar unicidad de CURP antes de guardar
/*solicitudInscripcionSchema.pre('validate', async function(next) {
  const curps = this.ninos.map(nino => nino.claveCURP);
  const uniqueCurps = new Set(curps);
  
  if (curps.length !== uniqueCurps.size) {
    return next(new Error('Las CURPs deben ser únicas entre los niños.'));
  }
  
  // Verificar que las CURPs no existan ya en la colección de Nino
  const existingNinos = await Nino.find({ claveCURP: { $in: curps } });
  if (existingNinos.length > 0) {
    return next(new Error('Una o más CURPs ya están registradas en la base de datos.'));
  }
  
  next();
});*/

module.exports = mongoose.model('SolicitudInscripcion', solicitudInscripcionSchema);
