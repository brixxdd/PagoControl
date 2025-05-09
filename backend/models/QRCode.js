const mongoose = require('mongoose');

const QRCodeSchema = new mongoose.Schema({
  qrData: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QRCode', QRCodeSchema); 