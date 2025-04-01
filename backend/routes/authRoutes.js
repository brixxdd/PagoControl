const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');
const Nino = require('../models/Nino');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/authMiddleware');

// Registro de tutor
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellidos, numeroContacto, direccion, numeroEmergencia, email } = req.body;

    // Verificar si el email ya existe
    const tutorExistente = await Tutor.findOne({ email });
    if (tutorExistente) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Crear nuevo tutor
    const tutor = new Tutor({
      nombre,
      apellidos,
      numeroContacto,
      direccion,
      numeroEmergencia,
      email
    });

    await tutor.save();

    // Generar token
    const token = jwt.sign(
      { 
        id: tutor._id,
        email: tutor.email,
        isAdmin: tutor.isAdmin
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      message: 'Tutor registrado exitosamente',
      token,
      user: {
        id: tutor._id,
        nombre: tutor.nombre,
        apellidos: tutor.apellidos,
        email: tutor.email,
        isAdmin: tutor.isAdmin
      }
    });
  } catch (error) {
    console.error('Error en registro de tutor:', error);
    res.status(500).json({ message: 'Error al registrar el tutor', error: error.message });
  }
});

// Registro de niño
router.post('/registro-nino', async (req, res) => {
  try {
    const { nombreCompleto, tipoSangre, alergias, edad, genero, fechaNacimiento, tutorId } = req.body;

    // Verificar que el tutor existe
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' });
    }

    // Crear nuevo niño
    const nino = new Nino({
      nombreCompleto,
      tipoSangre,
      alergias,
      edad,
      genero,
      fechaNacimiento,
      tutorId
    });

    await nino.save();

    res.status(201).json({
      message: 'Niño registrado exitosamente',
      nino
    });
  } catch (error) {
    console.error('Error en registro de niño:', error);
    res.status(500).json({ message: 'Error al registrar el niño', error: error.message });
  }
});

// Obtener niños por tutor
router.get('/ninos/:tutorId', async (req, res) => {
  try {
    const ninos = await Nino.find({ tutorId: req.params.tutorId });
    res.json(ninos);
  } catch (error) {
    console.error('Error al obtener niños:', error);
    res.status(500).json({ message: 'Error al obtener los niños', error: error.message });
  }
});

router.put('/complete-registration', authenticateToken, async (req, res) => {
  try {
    const { numeroContacto, direccion, numeroEmergencia } = req.body;
    
    if (!numeroContacto || !direccion || !numeroEmergencia) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.user.id,
      { 
        numeroContacto, 
        direccion, 
        numeroEmergencia,
        registroCompleto: true 
      },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor no encontrado' });
    }

    res.json({ 
      message: 'Registro completado exitosamente',
      user: tutor 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al completar el registro',
      error: error.message 
    });
  }
});

module.exports = router; 