const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin2 } = require('../middleware/auth');
const Pago = require('../models/Pago');
const SolicitudPago = require('../models/SolicitudPago');
const Nino = require('../models/Nino');
const Tutor = require('../models/Tutor');
const Escuela = require('../models/Escuela');
const { generateQRCode } = require('../utils/qrService');
const mongoose = require('mongoose');

// Ruta para crear una solicitud de pago (tutor)
router.post('/solicitud-pago', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const tutorId = req.user.id;
      const { escuelaId: escuelaIdentificador, ninos, periodoPago } = req.body;

      if (!Array.isArray(ninos) || ninos.length === 0) {
        throw { status: 400, message: 'No hay niños en la solicitud' };
      }

      // Buscar escuela
      const escuela = await Escuela
        .findOne({ identificador: escuelaIdentificador })
        .session(session);
      
      if (!escuela) {
        throw { status: 404, message: `Escuela '${escuelaIdentificador}' no existe` };
      }

      // Crear la solicitud
      const [solicitud] = await SolicitudPago.create([{
        tutorId,
        escuelaId: escuela._id,
        ninos,
        periodoPago,
        estado: 'pendiente'
      }], { session });

      // Generar QR
      const destino = `${process.env.BACKEND_URL2}/admin/solicitud-pago/${solicitud._id}`;
      const qrDataUrl = await generateQRCode(destino, tutorId, { size: 400, margin: 2 }, session);

      // Actualizar la solicitud con el QR
      await SolicitudPago.updateOne(
        { _id: solicitud._id },
        { $set: { codigoQR: qrDataUrl } },
        { session }
      );

      // Responder al cliente
      res.status(201).json({
        message: 'Solicitud de pago creada exitosamente',
        solicitudId: solicitud._id,
        codigoQR: qrDataUrl
      });
    });
  } catch (err) {
    console.error('Error en creación de solicitud de pago:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Error inesperado' });
  } finally {
    session.endSession();
  }
});

// Ruta para obtener solicitudes de pago del tutor
router.get('/mis-solicitudes-pago', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { escuelaId } = req.query;
    
    let query = { tutorId };
    
    // Filtrar por escuela si se proporciona
    if (escuelaId) {
      const escuela = await Escuela.findOne({ identificador: escuelaId });
      if (escuela) {
        query.escuelaId = escuela._id;
      }
    }
    
    const solicitudes = await SolicitudPago.find(query)
      .populate('escuelaId', 'nombre identificador logoUrl')
      .sort({ fechaSolicitud: -1 });
    
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes de pago:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes de pago', 
      error: error.message 
    });
  }
});

// Ruta para obtener el historial de pagos del tutor
router.get('/historial-pagos', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { escuelaId } = req.query;
    
    let query = { tutorId };
    
    // Filtrar por escuela si se proporciona
    if (escuelaId) {
      const escuela = await Escuela.findOne({ identificador: escuelaId });
      if (escuela) {
        query.escuelaId = escuela._id;
      }
    }
    
    const pagos = await Pago.find(query)
      .populate('ninoId', 'nombre apellidoPaterno numeroCamiseta')
      .populate('escuelaId', 'nombre identificador')
      .sort({ fechaPago: -1 });
    
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ 
      message: 'Error al obtener historial de pagos', 
      error: error.message 
    });
  }
});

// Ruta para obtener niños inscritos del tutor
router.get('/ninos-inscritos', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { escuelaId } = req.query;
    
    let query = { tutorId };
    
    // Filtrar por escuela si se proporciona
    if (escuelaId) {
      const escuela = await Escuela.findOne({ identificador: escuelaId });
      if (escuela) {
        query.escuelaId = escuela._id;
      }
    }
    
    const ninos = await Nino.find(query)
      .populate('escuelaId', 'nombre identificador')
      .sort({ nombre: 1 });
    
    // Calcular si el pago está actualizado para cada niño
    const ninosConEstadoPago = await Promise.all(ninos.map(async (nino) => {
      const ninoObj = nino.toObject();
      
      // Obtener el mes y año actual
      const now = new Date();
      const mesActual = now.getMonth() + 1;
      const anoActual = now.getFullYear();
      
      // Verificar si existe un pago para el mes actual
      const pagoActual = await Pago.findOne({
        ninoId: nino._id,
        concepto: 'mensualidad',
        'periodoPago.mes': mesActual,
        'periodoPago.ano': anoActual
      });
      
      ninoObj.pagoActualizado = !!pagoActual;
      
      return ninoObj;
    }));
    
    res.json(ninosConEstadoPago);
  } catch (error) {
    console.error('Error al obtener niños inscritos:', error);
    res.status(500).json({ 
      message: 'Error al obtener niños inscritos', 
      error: error.message 
    });
  }
});

// Rutas de administración
// Obtener todas las solicitudes de pago (admin)
router.get('/admin/solicitudes-pago', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { escuelaId, estado } = req.query;
    
    let query = {};
    
    // Filtrar por escuela si se proporciona
    if (escuelaId) {
      const escuela = await Escuela.findOne({ identificador: escuelaId });
      if (escuela) {
        query.escuelaId = escuela._id;
      }
    }
    
    // Filtrar por estado si se proporciona
    if (estado) {
      query.estado = estado;
    }
    
    const solicitudes = await SolicitudPago.find(query)
      .populate('tutorId', 'nombre apellidos email numeroContacto')
      .populate('escuelaId', 'nombre identificador')
      .sort({ fechaSolicitud: -1 });
    
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes de pago:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes de pago', 
      error: error.message 
    });
  }
});

// Obtener una solicitud de pago específica (admin)
router.get('/admin/solicitud-pago/:id', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { id } = req.params;
    
    const solicitud = await SolicitudPago.findById(id)
      .populate('tutorId', 'nombre apellidos email numeroContacto direccion')
      .populate('escuelaId', 'nombre identificador');
    
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    // Si hay niños con ID, obtener información detallada
    if (solicitud.ninos && solicitud.ninos.length > 0) {
      const ninoIds = solicitud.ninos
        .filter(n => n.ninoId)
        .map(n => n.ninoId);
      
      if (ninoIds.length > 0) {
        const ninosData = await Nino.find({ _id: { $in: ninoIds } });
        
        // Añadir datos de los niños a la respuesta
        res.json({
          ...solicitud.toObject(),
          ninosData: ninosData
        });
        return;
      }
    }
    
    res.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud de pago:', error);
    res.status(500).json({ 
      message: 'Error al obtener la solicitud de pago', 
      error: error.message 
    });
  }
});

// Procesar una solicitud de pago (admin)
router.post('/admin/procesar-pago', verifyToken, isAdmin2, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const { solicitudPagoId, pagos, observaciones, montoTotal } = req.body;
      
      if (!pagos || !Array.isArray(pagos) || pagos.length === 0) {
        throw { status: 400, message: 'No hay pagos para procesar' };
      }
      
      // Obtener la solicitud
      const solicitud = await SolicitudPago.findById(solicitudPagoId).session(session);
      if (!solicitud) {
        throw { status: 404, message: 'Solicitud no encontrada' };
      }
      
      // Verificar que los niños pertenecen a la solicitud
      const ninosEnSolicitud = solicitud.ninos.map(n => n.ninoId?.toString());
      
      for (const pago of pagos) {
        if (!ninosEnSolicitud.includes(pago.ninoId?.toString())) {
          throw { 
            status: 400, 
            message: `El niño con ID ${pago.ninoId} no está incluido en esta solicitud` 
          };
        }
      }
      
      // Crear los registros de pago
      const pagosCreados = await Pago.create(
        pagos.map(p => ({
          ...p,
          solicitudPagoId: solicitudPagoId,
          procesadoPor: req.user.id
        })), 
        { session }
      );
      
      // Actualizar la solicitud
      await SolicitudPago.updateOne(
        { _id: solicitudPagoId },
        { 
          $set: { 
            estado: 'procesado',
            observaciones,
            montoTotal,
            fechaProcesamiento: new Date()
          } 
        },
        { session }
      );
      
      res.status(201).json({
        message: 'Pago procesado exitosamente',
        pagos: pagosCreados
      });
    });
  } catch (err) {
    console.error('Error al procesar pago:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Error inesperado' });
  } finally {
    session.endSession();
  }
});

// Generar reporte de pagos (admin)
router.get('/admin/reporte-pagos', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { escuelaId: escuelaIdentificador, mes, ano } = req.query;
    
    if (!escuelaIdentificador || !mes || !ano) {
      return res.status(400).json({ 
        message: 'Faltan parámetros: escuelaId, mes y año son requeridos' 
      });
    }
    
    // Encontrar escuela
    const escuela = await Escuela.findOne({ identificador: escuelaIdentificador });
    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }
    
    // Obtener todos los pagos del mes
    const pagos = await Pago.find({
      escuelaId: escuela._id,
      'periodoPago.mes': parseInt(mes),
      'periodoPago.ano': parseInt(ano)
    })
    .populate('ninoId', 'nombre apellidoPaterno')
    .populate('tutorId', 'nombre apellidos');
    
    // Calcular el total recaudado
    const totalRecaudado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    
    // Encontrar niños con pagos pendientes
    const todosLosNinos = await Nino.find({ escuelaId: escuela._id })
      .populate('tutorId', 'nombre apellidos');
    
    const ninosConPago = pagos
      .filter(p => p.concepto === 'mensualidad')
      .map(p => p.ninoId._id.toString());
    
    const ninosSinPago = todosLosNinos.filter(
      nino => !ninosConPago.includes(nino._id.toString())
    );
    
    // Preparar datos para el reporte
    const detallesPendientes = ninosSinPago.map(nino => ({
      ninoId: nino._id,
      ninoNombre: `${nino.nombre} ${nino.apellidoPaterno}`,
      tutorId: nino.tutorId._id,
      tutorNombre: `${nino.tutorId.nombre} ${nino.tutorId.apellidos}`,
      montoPendiente: nino.precio || (todosLosNinos.filter(n => 
        n.tutorId._id.toString() === nino.tutorId._id.toString()
      ).length > 1 ? 200 : 250)
    }));
    
    res.json({
      escuelaId: escuela._id,
      escuelaNombre: escuela.nombre,
      mes: parseInt(mes),
      ano: parseInt(ano),
      totalRecaudado,
      pagosCompletados: pagos.filter(p => p.concepto === 'mensualidad').length,
      pagosPendientes: ninosSinPago.length,
      detallesPendientes
    });
  } catch (error) {
    console.error('Error al generar reporte de pagos:', error);
    res.status(500).json({ 
      message: 'Error al generar reporte de pagos', 
      error: error.message 
    });
  }
});

// Ruta para obtener todos los pagos (admin)
router.get('/admin/pagos', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { escuelaId: escuelaIdentificador, tutorId, mes, ano } = req.query;
    
    let query = {};
    
    // Filtrar por escuela si se proporciona
    if (escuelaIdentificador) {
      const escuela = await Escuela.findOne({ identificador: escuelaIdentificador });
      if (escuela) {
        query.escuelaId = escuela._id;
      }
    }
    
    // Filtrar por tutor si se proporciona
    if (tutorId) {
      query.tutorId = tutorId;
    }
    
    // Filtrar por mes y año si se proporcionan
    if (mes && ano) {
      query['periodoPago.mes'] = parseInt(mes);
      query['periodoPago.ano'] = parseInt(ano);
    }
    
    const pagos = await Pago.find(query)
      .populate('tutorId', 'nombre apellidos email')
      .populate('ninoId', 'nombre apellidoPaterno numeroCamiseta')
      .populate('escuelaId', 'nombre identificador')
      .populate('procesadoPor', 'nombre apellidos')
      .sort({ fechaPago: -1 });
    
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ 
      message: 'Error al obtener pagos', 
      error: error.message 
    });
  }
});

// Obtener lista de tutores (admin)
router.get('/admin/tutores', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { escuelaId: escuelaIdentificador } = req.query;
    
    if (!escuelaIdentificador) {
      return res.status(400).json({ message: 'El parámetro escuelaId es requerido' });
    }
    
    // Encontrar escuela
    const escuela = await Escuela.findOne({ identificador: escuelaIdentificador });
    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }
    
    // Encontrar niños de la escuela para obtener los tutores
    const ninos = await Nino.find({ escuelaId: escuela._id })
      .select('tutorId')
      .distinct('tutorId');
    
    // Obtener información de los tutores
    const tutores = await Tutor.find({ _id: { $in: ninos } })
      .sort({ nombre: 1, apellidos: 1 });
    
    res.json(tutores);
  } catch (error) {
    console.error('Error al obtener tutores:', error);
    res.status(500).json({ 
      message: 'Error al obtener tutores', 
      error: error.message 
    });
  }
});

// Obtener detalles de niños específicos (admin)
router.get('/admin/ninos', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'El parámetro ids es requerido' });
    }
    
    const idList = ids.split(',');
    
    const ninos = await Nino.find({ _id: { $in: idList } })
      .populate('tutorId', 'nombre apellidos email')
      .populate('escuelaId', 'nombre identificador');
    
    res.json(ninos);
  } catch (error) {
    console.error('Error al obtener niños:', error);
    res.status(500).json({ 
      message: 'Error al obtener información de niños', 
      error: error.message 
    });
  }
});

// Ruta para obtener estado de pagos del tutor
router.get('/estado-pagos', verifyToken, async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { escuelaId } = req.query;
    
    if (!escuelaId) {
      return res.status(400).json({ message: 'El parámetro escuelaId es requerido' });
    }
    
    // Buscar escuela
    const escuela = await Escuela.findOne({ identificador: escuelaId });
    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }
    
    // Obtener niños del tutor en esta escuela
    const ninos = await Nino.find({ 
      tutorId, 
      escuelaId: escuela._id 
    });
    
    // Obtener información de pagos para cada niño
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anoActual = fechaActual.getFullYear();
    
    let ninosPendientes = 0;
    const ninosConEstado = await Promise.all(ninos.map(async (nino) => {
      const ninoObj = nino.toObject();
      
      // Verificar si tiene pago para el mes actual
      const tienePago = await Pago.findOne({
        ninoId: nino._id,
        'periodoPago.mes': mesActual,
        'periodoPago.ano': anoActual,
        concepto: 'mensualidad'
      });
      
      ninoObj.pagoActualizado = !!tienePago;
      
      if (!tienePago) {
        ninosPendientes++;
      }
      
      return ninoObj;
    }));
    
    // Determinar próximo periodo de pago
    let proximoPeriodo;
    const dia = fechaActual.getDate();
    const nombreMes = new Date(anoActual, mesActual - 1).toLocaleString('es-MX', { month: 'long' });
    
    if (dia < 5) {
      proximoPeriodo = `Del 1 al 5 de ${nombreMes}`;
    } else if (dia < 15) {
      proximoPeriodo = `Del 15 al 20 de ${nombreMes}`;
    } else if (dia < 20) {
      proximoPeriodo = `Del 15 al 20 de ${nombreMes}`;
    } else {
      const siguienteMes = mesActual === 12 ? 1 : mesActual + 1;
      const nombreSiguienteMes = new Date(anoActual, siguienteMes - 1).toLocaleString('es-MX', { month: 'long' });
      proximoPeriodo = `Del 1 al 5 de ${nombreSiguienteMes}`;
    }
    
    res.json({
      ninos: ninosConEstado,
      ninosPendientes,
      proximoPeriodo
    });
  } catch (error) {
    console.error('Error al obtener estado de pagos:', error);
    res.status(500).json({ 
      message: 'Error al obtener estado de pagos', 
      error: error.message 
    });
  }
});

// Obtener un pago específico (admin)
router.get('/admin/pago/:id', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { id } = req.params;
    
    const pago = await Pago.findById(id)
      .populate('tutorId', 'nombre apellidos email telefono')
      .populate('ninoId', 'nombre apellidoPaterno apellidoMaterno fechaNacimiento claveCURP')
      .populate('escuelaId', 'nombre identificador')
      .populate('procesadoPor', 'nombre apellidos');
    
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    res.json(pago);
  } catch (error) {
    console.error('Error al obtener detalles del pago:', error);
    res.status(500).json({ 
      message: 'Error al obtener detalles del pago', 
      error: error.message 
    });
  }
});

module.exports = router;
