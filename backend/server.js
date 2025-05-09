require('dotenv').config();
// console.log('Variables de entorno:', {
//   MONGODB_URI: process.env.MONGODB_URI ? 'Presente' : 'Falta',
//   CLIENT_ID: process.env.CLIENT_ID ? 'Presente' : 'Falta',
//   JWT_SECRET: process.env.JWT_SECRET ? 'Presente' : 'Falta'
// });

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Solicitud = require('./models/Solicitud');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Proyector = require('./models/Proyector');
const multer = require('multer');
const path = require('path');
const Document = require('./models/Document');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const FileType = require('file-type');
const proyectorRoutes = require('./routes/proyectorRoutes');
const Notification = require('./models/Notification');
const cleanupFiles = require('./utils/cleanupFiles');
const cron = require('node-cron');
const { uploadPdf, cleanupOldFiles, verificarUrlCloudinary } = require('./services/cloudinaryService');
const qrCodeRoutes = require('./routes/qrCodeRoutes');
const authRoutes = require('./routes/authRoutes');
const Tutor = require('./models/Tutor');
const Nino = require('./models/Nino');
const Escuela = require('./models/Escuela');
const escuelaRoutes = require('./routes/escuelaRoutes');
const SolicitudInscripcion = require('./models/SolicitudInscripcion');
const { generateQRCode } = require('./utils/qrService');
const pagoRoutes = require('./routes/pagoRoutes');
const Pago = require('./models/Pago');
const SolicitudPago = require('./models/SolicitudPago');
const actualizacionService = require('./services/actualizacionService');
const notificacionService = require('./services/notificacionService');




// Lista de correos administrativos - MOVER ESTA DEFINICIÓN AL NIVEL SUPERIOR
const ADMIN_EMAILS = [
  'proyectoresunach@gmail.com',
  'fanny.cordova@unach.mx',
  'nidia.guzman@unach.mx',
  'deysi.gamboa@unach.mx',
  'diocelyne.arrevillaga@unach.mx',
  'karol.carrazco@unach.mx',
  'karen.portillo@unach.mx',
  'pedro.escobar@unach.mx',
  'brianes666@gmail.com',
  'brianfloresxxd@gmail.com',
  'dianasenger388@gmail.com',
  'nuevo.correo@unach.mx'
];

if (!process.env.CLIENT_ID || !process.env.JWT_SECRET) {
  console.error('Error: Variables de entorno no configuradas correctamente');
  console.error('CLIENT_ID:', process.env.CLIENT_ID ? 'Presente' : 'Falta');
  console.error('JWT_SECRET:', process.env.JWT_SECRET ? 'Presente' : 'Falta');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const oauth2Client = new OAuth2Client(CLIENT_ID);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://pago-control.vercel.app',
    'https://pago-control-b9bkf73ku-brians-projects-12715d8a.vercel.app',
    'http://localhost:3001'
  ],
  credentials: true,
}));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "frame-ancestors 'self' https://accounts.google.com https://*.google.com; " +
    "frame-src 'self' https://accounts.google.com https://*.google.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://*.googleusercontent.com; " +
    "connect-src 'self' https://accounts.google.com https://*.google.com https://*.googleusercontent.com; " +
    "img-src 'self' data: https:; " +
    "style-src 'self' 'unsafe-inline';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  console.log('Petición recibida:', {
    método: req.method,
    ruta: req.path,
    parámetros: req.params,
    cuerpo: req.body
  });
  next();
});

app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;");
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de control de proyectores' });
});

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await User.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Lista de correos administrativos
    const ADMIN_EMAILS = [
      'proyectoresunach@gmail.com',
      'fanny.cordova@unach.mx',
      'nidia.guzman@unach.mx',
      'deysi.gamboa@unach.mx',
      'diocelyne.arrevillaga@unach.mx',
      'karol.carrazco@unach.mx',
      'karen.portillo@unach.mx',
      'pedro.escobar@unach.mx',
      'brianes666@gmail.com',
      'brianfloresxxd@gmail.com',
      'dianasenger388@gmail.com',
      'nuevo.correo@unach.mx'
    ];
    
    // Asegurarse de que isAdmin esté correctamente establecido
    if (!decoded.isAdmin && ADMIN_EMAILS.includes(decoded.email)) {
      decoded.isAdmin = true;
    }
    
    req.user = decoded;
    console.log("Usuario verificado:", {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin
    });
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

app.get('/check-session', verifyToken, async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id);
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' });
    }
    
    res.json({ 
      user: {
        ...tutor.toObject(),
        registroCompleto: Boolean(tutor.numeroContacto && tutor.direccion && tutor.numeroEmergencia)
      },
      message: 'Sesión válida' 
    });
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ message: 'Error al verificar la sesión' });
  }
});

app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Acceso concedido', user: req.user });
});

app.post('/login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Payload de Google inválido' });
    }

    const { email, name, picture } = payload;
    let pvez = false;
    let tutor = await Tutor.findOne({ email });

    if (!tutor) {
      // Crear nuevo tutor con datos básicos
      const nombreCompleto = name.split(' ');
      const nombre = nombreCompleto[0];
      const apellidos = nombreCompleto.slice(1).join(' ');

      tutor = new Tutor({
        nombre,
        apellidos,
        email,
        picture,
        isAdmin: ADMIN_EMAILS.includes(email),
        registroCompleto: false
      });
      await tutor.save();
      pvez = true;
    }

    const jwtToken = jwt.sign(
      { 
        id: tutor._id,
        email: tutor.email,
        isAdmin: ADMIN_EMAILS.includes(email)
      }, 
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: tutor._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login exitoso',
      user: tutor,
      token: jwtToken,
      refreshToken,
      pvez,
      needsRegistration: !tutor.registroCompleto
    });

  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({ 
      message: 'Autenticación fallida',
      error: error.message 
    });
  }
});

app.post('/calendar-event', verifyToken, async (req, res) => {
  const user = req.user;
  const googleToken = user.googleToken;

  try {
    const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    
    const event = {
      summary: 'Solicitud de proyector',
      start: {
        dateTime: '2024-10-02T09:00:00-07:00',
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: '2024-10-02T10:00:00-07:00',
        timeZone: 'America/Mexico_City',
      },
    };

    const response = await axios.post(calendarApiUrl, event, {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      }
    });

    res.status(200).json({ message: 'Evento creado en Google Calendar', event: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear evento en Google Calendar', error });
  }
});

app.put('/update-user', verifyToken, async (req, res) => {
  try {
    const { grado, grupo, turno } = req.body;
    const userId = req.user.id;

    // Validar los datos recibidos
    if (!grado || !grupo || !turno) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Actualizar el usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        grado, 
        grupo, 
        turno 
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      message: 'Usuario actualizado correctamente',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el usuario',
      error: error.message 
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.get('/solicitudes', verifyToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!req.user.isAdmin) {
      console.error(`Acceso denegado para ${req.user.email}. No es administrador.`);
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador.',
        userInfo: {
          email: req.user.email,
          isAdmin: req.user.isAdmin
        }
      });
    }
    
    console.log(`Solicitud de solicitudes por admin: ${req.user.email}`);
    
    // Obtener todas las solicitudes con información de usuario
    const solicitudes = await Solicitud.find()
      .populate('usuarioId')
      .populate('proyectorId')
      .sort({ fechaInicio: -1 });
    
    console.log(`Solicitudes encontradas: ${solicitudes.length}`);
    
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes',
      error: error.message
    });
  }
});

app.post('/solicitar-proyector', verifyToken, async (req, res) => {
  try {
    const { fechaInicio, fechaFin, motivo, eventId, grado, grupo, turno } = req.body;
    const usuarioId = req.user.id;
    
    // Log para debugging
    // console.log('Datos recibidos:', {
    //   fechaInicio,
    //   fechaFin,
    //   motivo,
    //   eventId,
    //   grado,
    //   grupo,
    //   turno,
    //   usuarioId
    // });

    // Validaciones mejoradas
    if (!fechaInicio || !fechaFin || !motivo || !eventId) {
      return res.status(400).json({ 
        message: 'Los campos fechaInicio, fechaFin, motivo y eventId son requeridos',
        camposRecibidos: {
          fechaInicio: !!fechaInicio,
          fechaFin: !!fechaFin,
          motivo: !!motivo,
          eventId: !!eventId
        }
      });
    }

    // Convertir fechas a objetos Date
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    const proyectorId = new mongoose.Types.ObjectId('650000000000000000000001');

    const nuevaSolicitud = new Solicitud({
      usuarioId: new mongoose.Types.ObjectId(usuarioId),
      proyectorId,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      motivo,
      eventId,
      grado: grado || null,
      grupo: grupo || null,
      turno: turno || null,
      estado: 'pendiente'
    });

    // Log antes de guardar
    console.log('Nueva solicitud a guardar:', nuevaSolicitud);

    const solicitudGuardada = await nuevaSolicitud.save();
    const solicitudConUsuario = await solicitudGuardada.populate('usuarioId');

    res.status(201).json({ 
      message: 'Solicitud creada exitosamente',
      solicitud: solicitudConUsuario
    });

  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization']?.split(' ')[1];
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    console.log('Intentando renovar en /refresh-token')
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await Tutor.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const newToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        isAdmin: ADMIN_EMAILS.includes(user.email)
      }, 
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ 
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        picture: user.picture,
        //aqui esta el pedo ya veran
        isAdmin: ADMIN_EMAILS.includes(user.email),
        numeroContacto: user.numeroContacto,
        direccion: user.direccion,
        numeroEmergencia: user.numeroEmergencia,
        registroCompleto: user.registroCompleto,
      }
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Middleware para verificar si es admin
const isAdmin = async (req, res, next) => {
  const userEmail = req.user.email;
  const ADMIN_EMAILS = [
    'proyectoresunach@gmail.com',
    'fanny.cordova@unach.mx',
    'nidia.guzman@unach.mx',
    'deysi.gamboa@unach.mx',
    'diocelyne.arrevillaga@unach.mx',
    'karol.carrazco@unach.mx',
    'karen.portillo@unach.mx',
    'pedro.escobar@unach.mx',
    'brianes666@gmail.com',
    'brianfloresxxd@gmail.com'
  ];
  
  if (!ADMIN_EMAILS.includes(userEmail)) {
    console.log('Acceso denegado para:', userEmail);
    return res.status(403).json({ 
      message: 'Acceso denegado: Se requieren privilegios de administrador' 
    });
  }
  
  console.log('Acceso de administrador concedido para:', userEmail);
  next();
};

// Rutas protegidas para admin
app.get('/admin/usuarios', verifyToken, isAdmin, async (req, res) => {
  try {
    const usuarios = await User.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

app.get('/admin/solicitudes', verifyToken, isAdmin, async (req, res) => {
  try {
    const solicitudes = await Solicitud.find().populate('usuarioId', 'nombre email');
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las solicitudes', error });
  }
});

app.put('/solicituds/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, proyectorId } = req.body;

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ 
        message: 'Estado no válido. Debe ser: pendiente, aprobado o rechazado' 
      });
    }

    //console.log('Actualizando solicitud:', { id, estado });

    const solicitudActualizada = await Solicitud.findByIdAndUpdate(
      id,
      { estado, proyectorId },
      { new: true }
    );

    if (!solicitudActualizada) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.json({ 
      message: 'Estado actualizado correctamente',
      solicitud: solicitudActualizada 
    });

  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({ message: 'Error al actualizar solicitud' });
  }
});

const uri = process.env.MONGODB_URI; // Asegurate de que esto esté configurado

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('Conectado a MongoDB Atlas! 🥳');
    mongoose.connection.on('connected', () => {
      console.log('MongoDB conectado a:', mongoose.connection.db.databaseName);
      console.log('Colecciones disponibles:', 
        mongoose.connection.db.listCollections().toArray()
      );
    });
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });

app.get('/mis-solicitudes', verifyToken, async (req, res) => {
  try {
    // Agregar más logs para debugging
    //console.log('Token recibido:', req.headers.authorization);
    //console.log('Usuario autenticado:', {
    //  id: req.user.id,
    //  email: req.user.email
    //});

    const solicitudes = await Solicitud.find({ 
      usuarioId: req.user.id 
    });
    
    // Log para ver la consulta
    //console.log('Consulta MongoDB:', {
    //  usuarioId: req.user.id,
    //  encontradas: solicitudes.length
    //});

    // Si no hay solicitudes, enviar array vacío pero con mensaje
    if (!solicitudes || solicitudes.length === 0) {
      console.log('No se encontraron solicitudes para el usuario');
      return res.json([]);
    }

    const solicitudesFormateadas = await Solicitud.find({ 
      usuarioId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .select('_id motivo fechaInicio fechaFin estado')
    .lean();

    res.json(solicitudesFormateadas);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes',
      error: error.message 
    });
  }
});

// Ruta para obtener estadísticas del dashboard
app.get('/dashboard-stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener todas las solicitudes del usuario
    const solicitudesUsuario = await Solicitud.find({ usuarioId: userId });
    
    // Calcular estadísticas
    const stats = {
      solicitudesActivas: solicitudesUsuario.filter(s => s.estado === 'aprobado').length,
      misSolicitudes: solicitudesUsuario.length,
      // Otras estadísticas que quieras incluir
      proyectoresDisponibles: await Proyector.countDocuments({ estado: 'disponible' }),
      solicitudesPendientes: solicitudesUsuario.filter(s => s.estado === 'pendiente').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
});

app.get('/api/mis-solicitudes', verifyToken, async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ 
      usuarioId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .populate('proyectorId', 'nombre codigo')
    .select('materia profesor salon fechaInicio fechaFin estado motivo comentarios')
    .lean();

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
});

// Endpoint para subir PDFs
app.post('/upload-pdf', verifyToken, async (req, res) => {
  try {
    console.log("Iniciando proceso de subida de PDF");
    // Verificar si el usuario ya ha subido un documento esta semana
    const userId = req.user.id;
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Domingo
    
    const existingDoc = await Document.findOne({
      usuarioId: userId,
      createdAt: { $gte: startOfWeek }
    });
    
    if (existingDoc) {
      return res.status(403).json({
        message: 'Ya has subido un documento esta semana. Solo se permite un documento por usuario por semana.'
      });
    }
    
    // Proceder con la subida si no hay documentos esta semana
    uploadPdf.single('file')(req, res, async (err) => {
      if (err) {
        console.error("Error en multer durante la subida:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'El archivo excede el límite de 2MB' });
        }
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        console.error("No se recibió ningún archivo en la solicitud");
        return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
      }
      
      console.log("Archivo subido a Cloudinary. Detalles completos:", JSON.stringify(req.file, null, 2));
      console.log("URL del archivo en Cloudinary:", req.file.path);
      console.log("Nombre original del archivo:", req.file.originalname);
      
      // Asegurarse de que estamos usando la URL correcta de Cloudinary
      const fileUrl = req.file.path;
      
      // Crear registro en la base de datos con la URL de Cloudinary
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      
      const newDocument = new Document({
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileUrl: fileUrl,
        usuarioId: userId,
        email: req.body.email,
        nombre: req.body.nombre,
        grado: req.body.grado,
        grupo: req.body.grupo,
        turno: req.body.turno,
        estado: 'pendiente',
        expirationDate: expirationDate
      });
      
      const savedDocument = await newDocument.save();
      console.log("Documento guardado en la base de datos:", JSON.stringify(savedDocument, null, 2));
      
      // Crear notificación para administradores
      const admins = await User.find({ isAdmin: true });
      
      for (const admin of admins) {
        const notification = new Notification({
          tipo: 'documento',
          mensaje: `${req.body.nombre} ha subido un nuevo documento para revisión`,
          destinatario: admin._id,
          remitente: userId,
          leida: false,
          enlace: `/admin/documentos`,
          entidadId: savedDocument._id,
          entidadTipo: 'Document'
        });
        
        await notification.save();
      }
      
      res.status(201).json({ 
        message: 'Documento subido correctamente',
        document: savedDocument
      });
    });
  } catch (error) {
    console.error("Error general en la subida de PDF:", error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Endpoint para obtener la lista de correos de administradores
app.get('/api/admin-emails', (req, res) => {
  try {
    console.log("Petición recibida para obtener correos de administradores");
    res.json({ adminEmails: ADMIN_EMAILS });
  } catch (error) {
    console.error('Error al obtener correos de administradores:', error);
    res.status(500).json({ message: 'Error al obtener correos de administradores', error: error.message });
  }
});

// Endpoint para obtener los datos más recientes del usuario
app.get('/user-data', verifyToken, async (req, res) => {
  try {
    const usuario = await Tutor.findById(req.user.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('Datos del usuario enviados desde /user-data:', usuario);
    
    res.json({ 
      user: usuario
    });
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener datos del usuario' });
  }
});

// Endpoint para ver documentos sin token (solo para visualización)
app.get('/view-document/:id', async (req, res) => {
  try {
    const documento = await Document.findById(req.params.id);
    
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Usar la URL de Cloudinary directamente
    const fileUrl = documento.fileUrl || documento.filePath;
    
    if (!fileUrl) {
      return res.status(404).json({ message: 'URL del documento no encontrada' });
    }
    
    // Redirigir al usuario a la URL de Cloudinary
    return res.redirect(fileUrl);
    
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ message: 'Error al obtener documento', error: error.message });
  }
});

// Ruta para crear notificación
app.post('/api/notifications', verifyToken, isAdmin, async (req, res) => {
  try {
    const { usuarioId, mensaje, tipo } = req.body;
    
    const notification = new Notification({
      usuarioId,
      mensaje,
      tipo
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear notificación' });
  }
});

// Ruta para obtener notificaciones del usuario
app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      usuarioId: req.user.id,
      leida: false 
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
});

// Ruta para marcar notificación como leída
app.put('/api/notifications/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { leida: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar notificación' });
  }
});

// Ruta para marcar todas las notificaciones como leídas
app.put('/api/notifications/mark-all-read', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        usuarioId: req.user.id,
        leida: false 
      },
      { leida: true }
    );
    
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ message: 'Error al actualizar notificaciones' });
  }
});
  

// Programar limpieza semanal (cada domingo a las 00:00)
cron.schedule('0 0 * * 0', async () => {
  console.log('Ejecutando limpieza programada de archivos...');
  try {
    // Limpiar archivos en Cloudinary
    const deletedCount = await cleanupOldFiles();
    
    // Limpiar registros en la base de datos
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const result = await Document.deleteMany({
      createdAt: { $lt: oneWeekAgo }
    });
    
    console.log(`Limpieza de base de datos completada. ${result.deletedCount} registros eliminados.`);
  } catch (err) {
    console.error('Error en limpieza programada:', err);
  }
});

// Endpoint para obtener documentos por usuario
app.get('/documentos/usuario/:id', verifyToken, async (req, res) => {
  try {
    console.log("Buscando documentos para el usuario:", req.params.id);
    const documentos = await Document.find({ usuarioId: req.params.id });
    console.log("Documentos encontrados:", documentos.length);
    
    if (documentos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron documentos para este usuario' });
    }
    
    res.json(documentos);
  } catch (error) {
    console.error('Error al obtener documentos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener documentos del usuario' });
  }
});

// Agregar un endpoint para verificar un documento específico
app.get('/verificar-documento/:id', verifyToken, async (req, res) => {
  try {
    const documento = await Document.findById(req.params.id);
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    console.log("Documento encontrado:", JSON.stringify(documento, null, 2));
    
    // Verificar si la URL es accesible
    const fileUrl = documento.fileUrl || documento.filePath;
    
    res.json({
      documento,
      urlVerificada: fileUrl,
      mensaje: 'Usa esta URL para acceder al documento'
    });
  } catch (error) {
    console.error('Error al verificar documento:', error);
    res.status(500).json({ message: 'Error al verificar documento' });
  }
});

// Endpoint para diagnosticar problemas con documentos
app.get('/api/diagnostico-documentos', verifyToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Obtener todos los documentos
    const documentos = await Document.find().sort({ createdAt: -1 }).limit(10);
    
    // Verificar cada documento
    const resultados = [];
    
    for (const doc of documentos) {
      const url = doc.fileUrl || doc.filePath;
      
      let verificacion;
      try {
        // Intentar verificar la URL en Cloudinary
        verificacion = await verificarUrlCloudinary(url);
      } catch (error) {
        verificacion = { valido: false, error: error.message };
      }
      
      resultados.push({
        _id: doc._id,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        filePath: doc.filePath,
        createdAt: doc.createdAt,
        verificacion
      });
    }
    
    res.json({
      mensaje: 'Diagnóstico completado',
      documentos: resultados,
      configuracion: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: '***' + process.env.CLOUDINARY_API_KEY.slice(-4) // Solo mostrar los últimos 4 dígitos por seguridad
      }
    });
  } catch (error) {
    console.error('Error en diagnóstico de documentos:', error);
    res.status(500).json({ message: 'Error en diagnóstico', error: error.message });
  }
});

// Rutas para proyectores
app.get('/api/proyectores', verifyToken, async (req, res) => {
  try {
    console.log("Solicitud recibida para obtener proyectores");
    const proyectores = await Proyector.find();
    console.log(`Se encontraron ${proyectores.length} proyectores`);
    res.json(proyectores);
  } catch (error) {
    console.error('Error al obtener proyectores:', error);
    res.status(500).json({ message: 'Error al obtener proyectores', error: error.message });
  }
});

app.post('/api/proyectores', verifyToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { grado, grupo, turno, estado } = req.body;
    
    // Generar código automáticamente
    const codigo = `PRY-${grado}${grupo}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const nuevoProyector = new Proyector({
      codigo,
      grado,
      grupo,
      turno,
      estado
    });
    
    const proyectorGuardado = await nuevoProyector.save();
    res.status(201).json(proyectorGuardado);
  } catch (error) {
    console.error('Error al crear proyector:', error);
    res.status(500).json({ message: 'Error al crear proyector', error: error.message });
  }
});

app.put('/api/proyectores/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    
    const proyectorActualizado = await Proyector.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    
    if (!proyectorActualizado) {
      return res.status(404).json({ message: 'Proyector no encontrado' });
    }
    
    res.json(proyectorActualizado);
  } catch (error) {
    console.error('Error al actualizar proyector:', error);
    res.status(500).json({ message: 'Error al actualizar proyector' });
  }
});

app.delete('/api/proyectores/:id', verifyToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const proyectorEliminado = await Proyector.findByIdAndDelete(req.params.id);
    
    if (!proyectorEliminado) {
      return res.status(404).json({ message: 'Proyector no encontrado' });
    }
    
    res.json({ message: 'Proyector eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proyector:', error);
    res.status(500).json({ message: 'Error al eliminar proyector', error: error.message });
  }
});

app.use('/qr-codes', qrCodeRoutes);

// Ruta para obtener el tema del usuario
app.get('/user-theme', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tutor = await Tutor.findById(userId);
    
    if (!tutor) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ 
      theme: tutor.theme || 'default',
      darkMode: tutor.darkMode || false
    });
    
  } catch (error) {
    console.error('Error al obtener tema:', error);
    res.status(500).json({ 
      message: 'Error al obtener el tema',
      error: error.message 
    });
  }
});

// Ruta para actualizar el tema y darkMode
app.put('/update-theme', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, darkMode } = req.body;
    
    const tutor = await Tutor.findById(userId);
    if (!tutor) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Actualizar solo los campos necesarios
    tutor.theme = theme;
    tutor.darkMode = darkMode;
    await tutor.save();
    
    res.json({ 
      theme: tutor.theme,
      darkMode: tutor.darkMode
    });
    
  } catch (error) {
    console.error('Error al actualizar tema:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el tema',
      error: error.message 
    });
  }
});

// Ruta para obtener el último tema usado (sin autenticación)
app.get('/last-theme', async (req, res) => {
  try {
    // Obtener el último tema y darkMode usados
    const ultimoTema = await Tutor.findOne({}, { theme: 1, darkMode: 1 })
      .sort({ updatedAt: -1 })
      .limit(1);
    
    // Asegurarnos de enviar ambos valores
    res.json({ 
      theme: ultimoTema?.theme || 'default',
      darkMode: ultimoTema?.darkMode || false
    });
  } catch (error) {
    console.error('Error al obtener último tema:', error);
    res.status(500).json({ 
      message: 'Error al obtener el tema',
      error: error.message 
    });
  }
});
  
// Ruta para registrar un niño
app.post('/auth/registro-nino', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;

    // 1) Extraemos escuelaIdentificador y el resto de campos
    const {
      apellidoPaterno,
      apellidoMaterno,
      nombre,
      claveCURP,
      fechaNacimiento,
      genero,
      tipoSangre,
      estado,
      municipioResidencia,
      codigoPostal,
      numeroCamiseta,
      alergias,
      cirugias,
      afecciones,
      nombrePadres,
      telefonos
    } = req.body;

    // Aquí guardamos en let el campo identificador que viene en req.body
    let escuelaObjectId;  
    const escuelaIdentificador = req.body.escuelaId;  // el identificador de tu modelo Escuela

    if (escuelaIdentificador) {
      const escuela = await Escuela.findOne({ identificador: escuelaIdentificador });
      if (!escuela) {
        return res
          .status(404)
          .json({ message: `No existe Escuela con identificador '${escuelaIdentificador}'` });
      }
      // Ahora sí podemos asignar al let
      escuelaObjectId = escuela._id;
    }

    // 2) Construimos el nuevo Nino con la referencia correcta
    const nuevoNino = new Nino({
      tutorId,
      apellidoPaterno,
      apellidoMaterno,
      nombre,
      claveCURP,
      fechaNacimiento,
      genero,
      tipoSangre,
      estado,
      municipioResidencia,
      codigoPostal,
      numeroCamiseta,
      alergias,
      cirugias,
      afecciones,
      nombrePadres,
      telefonos,
      // Solo incluimos escuelaId si existía identificador
      ...(escuelaObjectId && { escuelaId: escuelaObjectId })
    });

    console.log('Datos del nuevo niño:', nuevoNino);

    const ninoGuardado = await nuevoNino.save();

    res.status(201).json({
      message: 'Jugador registrado exitosamente',
      nino: ninoGuardado
    });

  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({
      message: 'Error al registrar jugador',
      error: error.message
    });
  }
});

// Ruta para obtener jugadores de un tutor
app.get('/auth/jugadores', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { escuelaId } = req.query; // Obtener escuelaId de los parámetros de consulta
    
    let query = { tutorId };
    
    // Si se proporciona escuelaId, filtrar también por escuela
    if (escuelaId) {
      // 1) Buscar la escuela por su identificador
      const escuela = await Escuela.findOne({ identificador: escuelaId });
      if (!escuela) {
        return res
          .status(404)
          .json({ message: `No existe Escuela con identificador '${identEscuela}'` });
      }
      // 2) Usar su ObjectId real en el filtro
      query.escuelaId = escuela._id;
    }
    
    const jugadores = await Nino.find(query).sort({ createdAt: -1 }).populate('escuelaId', 'nombre identificador');;
    res.json(jugadores);
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({
      message: 'Error al obtener jugadores',
      error: error.message
    });
  }
});

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas para escuelas
app.use('/api/escuelas', escuelaRoutes);

// Ruta para obtener configuración de una escuela específica
app.get('/api/escuela-config/:identificador', async (req, res) => {
  try {
    const escuela = await Escuela.findOne({ 
      identificador: req.params.identificador,
      activa: true 
    });
    
    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada o inactiva' });
    }
    
    res.json({
      nombre: escuela.nombre,
      logoUrl: escuela.logoUrl,
      tema: escuela.tema,
      identificador: escuela.identificador,
      direccion: escuela.direccion,
      mision: escuela.mision,
      vision: escuela.vision,
      diasEntrenamiento: escuela.diasEntrenamiento
    });
  } catch (error) {
    console.error('Error al obtener configuración de escuela:', error);
    res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
  }
});

// Ruta para obtener todas las escuelas
app.get('/noapi/escuelas', async (req, res) => {
  try {
    const escuelas = await Escuela.find({ activa: true }); // Solo obtener escuelas activas
    res.json(escuelas);
  } catch (error) {
    console.error('Error al obtener todas las escuelas:', error);
    res.status(500).json({ message: 'Error al obtener escuelas', error: error.message });
  }
});

// Ruta para obtener las escuelas en las que el tutor tiene niños registrados
app.get('/api/escuelas-registradas', verifyToken, async (req, res) => {
  try {
    // Obtener los niños asociados al tutor
    const ninos = await Nino.find({ tutorId: req.user.id });

    // Obtener los IDs de las escuelas a partir de los niños
    const escuelaIds = ninos.map(nino => nino.escuelaId).filter(id => id); // Filtrar IDs nulos

    // Contar jugadores por escuela
    const jugadoresPorEscuela = {};
    ninos.forEach(nino => {
      if (nino.escuelaId) {
        const idString = nino.escuelaId.toString();
        jugadoresPorEscuela[idString] = (jugadoresPorEscuela[idString] || 0) + 1;
      }
    });

    // Obtener las escuelas únicas
    const escuelas = await Escuela.find({ _id: { $in: escuelaIds } });

    // Añadir el conteo de jugadores a cada escuela
    const escuelasConConteo = escuelas.map(escuela => {
      const escuelaObj = escuela.toObject();
      escuelaObj.jugadoresRegistrados = jugadoresPorEscuela[escuela._id.toString()] || 0;
      return escuelaObj;
    });

    res.json(escuelasConConteo);
  } catch (error) {
    console.error('Error al obtener escuelas registradas:', error);
    res.status(500).json({ message: 'Error al obtener escuelas registradas', error: error.message });
  }
});



//nuevas cosas para inscripcion
// Ruta para crear una solicitud de inscripción
app.post('/auth/solicitud-inscripcion', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const tutorId = req.user.id;
      const { escuelaId: escuelaIdentificador, ninos } = req.body;

      if (!Array.isArray(ninos) || ninos.length === 0) {
        throw { status: 400, message: 'No hay jugadores en la solicitud' };
      }

      // 1) Buscar escuela
      const escuela = await Escuela
        .findOne({ identificador: escuelaIdentificador })
        .session(session);
      if (!escuela) {
        throw { status: 404, message: `Escuela '${escuelaIdentificador}' no existe` };
      }

      // 2) Crear la solicitud
      const [solicitud] = await SolicitudInscripcion.create([{
        tutorId,
        escuelaId: escuela._id,
        ninos: ninos.map(n => ({ ...n, ninoId: null }))
      }], { session });

      // 3) Generar QR y guardar en la colección QRCode
      const destino = `${process.env.BACKEND_URL2}/admin/solicitud/${solicitud._id}`;
      const qrDataUrl = await generateQRCode(destino, tutorId, { size: 400, margin: 2 }, session);

      // 4) Actualizar la solicitud con el QR
      await SolicitudInscripcion.updateOne(
        { _id: solicitud._id },
        { $set: { codigoQR: qrDataUrl } },
        { session }
      );

      // 5) Responder al cliente
      res.status(201).json({
        message: 'Solicitud creada con QR registrado',
        solicitudId: solicitud._id,
        codigoQR: qrDataUrl
      });
    });
  } catch (err) {
    console.error('Error en creación de solicitud con QR:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Error inesperado' });
  } finally {
    session.endSession();
  }
});

/*app.post('/auth/solicitud-inscripcion', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { escuelaId: escuelaIdentificador, ninos } = req.body;
    
    // Validar que haya niños en la solicitud
    if (!ninos || ninos.length === 0) {
      return res.status(400).json({ message: 'No hay jugadores en la solicitud' });
    }
    
    // Encontrar la escuela por su identificador
    const escuela = await Escuela.findOne({ identificador: escuelaIdentificador });
    if (!escuela) {
      return res.status(404).json({ message: `No existe Escuela con identificador '${escuelaIdentificador}'` });
    }
    
    // Crear la solicitud
    const solicitud = new SolicitudInscripcion({
      tutorId,
      escuelaId: escuela._id,
      ninos: ninos.map(nino => ({
        ...nino,
        ninoId: null // Se llenará cuando se apruebe
      }))
    });
    
    // Generar código QR
    const solicitudId = solicitud._id.toString();
    const qrData = `${process.env.BACKEND_URL2}/admin/solicitud/${solicitudId}`;
    const qrCode = await generateQRCode(qrData);
    solicitud.codigoQR = qrCode;
    
    await solicitud.save();
    
    res.status(201).json({
      message: 'Solicitud de inscripción creada exitosamente',
      solicitudId: solicitudId,
      codigoQR: qrCode
    });
  } catch (error) {
    console.error('Error al crear solicitud de inscripción:', error);
    res.status(500).json({ 
      message: 'Error al crear solicitud de inscripción', 
      error: error.message 
    });
  }
});*/

// Ruta para el historial de solicitudes del tutor
app.get('/auth/mis-solicitudes-inscripcion', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;
    
    const solicitudes = await SolicitudInscripcion.find({ tutorId })
      .populate('escuelaId', 'nombre identificador logoUrl')
      .sort({ fechaSolicitud: -1 });
    
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes de inscripción', 
      error: error.message 
    });
  }
});

// Ruta para obtener solicitudes de inscripción del tutor de una escuela específica
app.get('/auth/mis-solicitudes-inscripcion/escuela/:escuelaId', verifyToken, async (req, res) => {
  try {
    const { escuelaId } = req.params;
    const tutorId = req.user.id;

    const escuela = await Escuela.findOne({ identificador: escuelaId })
    if (!escuela) {
      throw { status: 404, message: `Escuela '${escuelaId}' no existe` };
    }

    const solicitudes = await SolicitudInscripcion.find({ 
      tutorId, 
      escuelaId: escuela._id
    })
    .populate('escuelaId', 'nombre identificador logoUrl')
    .sort({ fechaSolicitud: -1 });

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes de inscripción por escuela:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes de inscripción', 
      error: error.message 
    });
  }
});

// Ruta para obtener una solicitud específica (admin)
app.get('/admin/solicitud/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const solicitud = await SolicitudInscripcion.findById(id)
      .populate('tutorId', 'nombre apellidos email numeroContacto')
      .populate('escuelaId', 'nombre identificador direccion');
    
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    res.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({ 
      message: 'Error al obtener la solicitud', 
      error: error.message 
    });
  }
});

// Ruta para procesar una solicitud (admin)
app.put('/admin/solicitud/:id', verifyToken, async (req, res) => {
  try {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { id } = req.params;
    const { estado, preciosPorNino, comentarios, precioTotal } = req.body;
    
    const solicitud = await SolicitudInscripcion.findById(id);
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    // Actualizar información de la solicitud
    solicitud.estado = estado;
    solicitud.preciosPorNino = preciosPorNino || [];
    solicitud.observaciones = comentarios;
    solicitud.fechaRespuesta = new Date();
    
    // Calcular precio total
    //solicitud.precioTotal = preciosPorNino.reduce((total, item) => total + item.precio, 0);
    solicitud.precioTotal = precioTotal;

    // Si se aprueba, crear los registros de niños
    if (estado === 'aprobada') {
      for (let i = 0; i < solicitud.ninos.length; i++) {
        const ninoData = solicitud.ninos[i];
        const precioInfo = preciosPorNino.find(p => p.ninoIndex === i) || { precio: 0 };
        console.log('Nino extraido de la solicitud: ',ninoData)
        // Crear el niño en la base de datos
        const nuevoNino = new Nino({
          tutorId: solicitud.tutorId,
          escuelaId: solicitud.escuelaId,
          precio: precioInfo.precio,
          nombre: ninoData.nombre,
          apellidoPaterno: ninoData.apellidoPaterno,
          apellidoMaterno: ninoData.apellidoMaterno,
          fechaNacimiento: ninoData.fechaNacimiento,
          claveCURP: ninoData.claveCURP,
          estado: ninoData.estado,
          municipioResidencia: ninoData.municipioResidencia,
          codigoPostal: ninoData.codigoPostal,
          numeroCamiseta: ninoData.numeroCamiseta,
          telefonos: ninoData.telefonos,
          tipoSangre: ninoData.tipoSangre,
          alergias: ninoData.alergias,
          cirugias: ninoData.cirugias,
          afecciones: ninoData.afecciones,
          nombrePadres: ninoData.nombrePadres,
          incluyeUniforme: ninoData.esUniforme || false // Asumiendo que este campo se envía correctamente
        });
        console.log('Nino a insertar: ',nuevoNino)
        const ninoGuardado = await nuevoNino.save();
        
        // Actualizar el ID en la solicitud
        solicitud.ninos[i].ninoId = ninoGuardado._id;
      }
    }
    
    await solicitud.save();
    
    res.json({ 
      message: `Solicitud ${estado} exitosamente`,
      solicitud
    });
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud', 
      error: error.message 
    });
  }
});

// Función auxiliar para generar códigos QR
/*const generateQRCode = async (data) => {
  const QRCode = require('qrcode');
  try {
    // Generar QR y subir a Cloudinary o guardar localmente
    const qrDataURL = await QRCode.toDataURL(data);
    // Aquí podrías subirlo a Cloudinary o usar otra forma de almacenamiento
    return qrDataURL;
  } catch (error) {
    console.error('Error al generar código QR:', error);
    throw error;
  }
};*/

// Ruta para obtener todas las solicitudes de inscripción (admin)
app.get('/admin/solicitudes-inscripcion', verifyToken, async (req, res) => {
  try {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const solicitudes = await SolicitudInscripcion.find()
      .populate('tutorId', 'nombre apellidos email numeroContacto')
      .populate('escuelaId', 'nombre identificador direccion')
      .sort({ fechaSolicitud: -1 });
    
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes de inscripción', 
      error: error.message 
    });
  }
});

// Ruta para obtener solicitudes de una escuela específica (admin)
app.get('/admin/solicitudes-inscripcion/escuela/:escuelaId', verifyToken, async (req, res) => {
  try {
    // 1) Verificar si es administrador
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // 2) Capturar el identificador de la escuela (no es ObjectId)
    const { escuelaId } = req.params;

    // 3) Buscar la escuela por su campo 'identificador'
    const identificadorEscuela = await Escuela.findOne({ identificador: escuelaId });
    if (!identificadorEscuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }
    
    // 4) Usar el _id real para consultar solicitudes
    const solicitudes = await SolicitudInscripcion.find({ escuelaId: identificadorEscuela._id })
      .populate('tutorId', 'nombre apellidos email numeroContacto')
      .populate('escuelaId', 'nombre identificador direccion')
      .sort({ fechaSolicitud: -1 });
    
    // 5) Devolver resultados
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes por escuela:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes de inscripción', 
      error: error.message 
    });
  }
});

app.use('/api', pagoRoutes);

/* Programar la actualización de precios cada noche a las 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Ejecutando actualización automática de precios...');
  await actualizacionService.actualizarPreciosMensualidad();
});*/

// Programar la verificación de pagos pendientes cada día a las 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Verificando pagos pendientes...');
  const pendientes = await actualizacionService.verificarPagosPendientes();
  
  // Aquí se podría implementar un sistema de notificaciones
  // para avisar a los administradores sobre los pagos pendientes
});

// Verificación específica los días 2 y 16 de cada mes para notificar 
// a los tutores sobre el vencimiento del período de pago
cron.schedule('0 9 2,16 * *', async () => {
  console.log('Enviando recordatorios de pago...');
  // Lógica para enviar notificaciones a tutores con pagos pendientes
  await notificacionService.enviarRecordatoriosPago();

});


