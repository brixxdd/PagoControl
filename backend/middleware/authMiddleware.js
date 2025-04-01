const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de acceso' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
      }

      // Verificar si el tutor existe en la base de datos
      const tutor = await Tutor.findById(decoded.id);
      if (!tutor) {
        return res.status(401).json({ message: 'Tutor no encontrado' });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ message: 'Error en la autenticación' });
  }
}; 