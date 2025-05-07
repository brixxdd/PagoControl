const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const { authenticateToken } = require('../middleware/authMiddleware'); // Asumiendo que tienes este middleware

// Ruta para guardar un nuevo código QR
router.post('/', authenticateToken, qrCodeController.saveQRCode);

// Ruta para obtener todos los códigos QR de un usuario
router.get('/user', authenticateToken, qrCodeController.getUserQRCodes);

// Ruta para eliminar un código QR
router.delete('/:id', authenticateToken, qrCodeController.deleteQRCode);

// Ruta para generar un código QR
router.post('/generate', authenticateToken, qrCodeController.generateQRCode);

module.exports = router; 