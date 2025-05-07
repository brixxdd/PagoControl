// utils/qrService.js
const fetch = require('node-fetch');
const QRCodeModel = require('../models/QRCode');

/**
 * Genera un QR vía API externa y guarda un registro en la colección QRCode.
 * @param {string} data — texto o URL a codificar.
 * @param {mongoose.Types.ObjectId} userId — ID del tutor que genera el QR.
 * @param {object} [opts] — opciones de tamaño y margen.
 * @param {object} [session] — sesión de Mongoose para transacciones (opcional).
 * @returns {Promise<string>} — el Data URL del QR generado.
 */
async function generateQRCode(data, userId, opts = {}, session = null) {
  const size   = opts.size ?? 300;
  const margin = opts.margin ?? 1;
  const apiUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
  apiUrl.searchParams.set('data', encodeURIComponent(data));
  apiUrl.searchParams.set('size', `${size}x${size}`);
  apiUrl.searchParams.set('margin', margin);

  // 1) Descargar PNG del QR
  const res = await fetch(apiUrl.toString());
  if (!res.ok) {
    throw new Error(`QR API error ${res.status} ${res.statusText}`);
  }
  const buffer = await res.buffer();
  const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

  // 2) Registrar en tu colección QRCode
  const qrDoc = new QRCodeModel({
    qrData: dataUrl,
    userId
  });
  // Si me pasaron sesión de transacción, úsala:
  if (session) {
    await qrDoc.save({ session });
  } else {
    await qrDoc.save();
  }

  return dataUrl;
}

module.exports = { generateQRCode };
