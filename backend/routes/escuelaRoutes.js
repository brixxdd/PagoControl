// routes/escuelaRoutes.js
const express = require('express');
const router = express.Router();
const Escuela = require('../models/Escuela');
const { verifyToken, isAdmin2 } = require('../middleware/auth');

// Crear nueva escuela (solo admin)
router.post('/', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { nombre, identificador, logoUrl, tema, mision, vision , diasEntrenamiento, direccion } = req.body;
    
    // Verificar si el identificador ya existe
    const existeEscuela = await Escuela.findOne({ identificador });
    if (existeEscuela) {
      return res.status(400).json({ message: 'Ya existe una escuela con ese identificador' });
    }
    
    // Crear nueva escuela con el objeto tema completo
    const nuevaEscuela = new Escuela({
      nombre,
      identificador,
      logoUrl,
      tema,
      mision,
      vision,
      diasEntrenamiento,
      direccion
    });
    
    const escuelaGuardada = await nuevaEscuela.save();
    res.status(201).json(escuelaGuardada);
  } catch (error) {
    console.error('Error al crear escuela:', error);
    res.status(500).json({ message: 'Error al crear la escuela', error: error.message });
  }
});

// Obtener todas las escuelas
router.get('/', verifyToken, isAdmin2, async (req, res) => {
  try {
    const escuelas = await Escuela.find().sort({ nombre: 1 });
    res.status(200).json(escuelas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener escuelas', error: error.message });
  }
});

// Obtener una escuela por su identificador
router.get('/:identificador', async (req, res) => {
  try {
    const escuela = await Escuela.findOne({ identificador: req.params.identificador });
    
    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }
    
    res.status(200).json(escuela);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la escuela', error: error.message });
  }
});

// Actualizar escuela
router.put('/:id', verifyToken, isAdmin2, async (req, res) => {
  try {
    const { nombre, logoUrl, tema, activa, mision, vision, diasEntrenamiento, direccion } = req.body;
    
    const escuelaActualizada = await Escuela.findByIdAndUpdate(
      req.params.id,
      { 
        nombre, 
        logoUrl, 
        tema,
        activa,
        mision,
        vision,
        diasEntrenamiento,
        direccion
      },
      { new: true }
    );
    
    if (!escuelaActualizada) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }
    
    res.status(200).json(escuelaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la escuela', error: error.message });
  }
});

// Eliminar escuela
router.delete('/:id', verifyToken, isAdmin2, async (req, res) => {
  try {
    const escuelaEliminada = await Escuela.findByIdAndDelete(req.params.id);
    
    if (!escuelaEliminada) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }
    
    res.status(200).json({ message: 'Escuela eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la escuela', error: error.message });
  }
});

// Obtener una escuela por su identificador y verificar si está activa
router.get('/:identificador/activa', async (req, res) => {
  try {
    const escuela = await Escuela.findOne({ 
      identificador: req.params.identificador,
      activa: true // Verificar que la escuela esté activa
    });
    
    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada o no activa' });
    }
    
    res.status(200).json(escuela.identificador);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la escuela', error: error.message });
  }
});

module.exports = router;