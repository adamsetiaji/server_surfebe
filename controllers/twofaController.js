// controllers/twofaController.js
const User = require('../models/User');
const speakeasy = require('speakeasy');

// Helper function untuk response WebSocket
const sendWSResponse = (ws, data) => {
  ws.send(JSON.stringify(data));
};

// Generate OTP berdasarkan secret dari database
exports.generateOTP = async (ws, email) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return sendWSResponse(ws, {
        success: false,
        error: 'User not found'
      });
    }

    if (!user.secret2faSurfebe) {
      return sendWSResponse(ws, {
        success: false,
        error: 'User does not have 2FA secret configured'
      });
    }

    // Generate token menggunakan secret dari database
    const token = speakeasy.totp({
      secret: user.secret2faSurfebe,
      encoding: 'base32'
    });

    sendWSResponse(ws, {
      success: true,
      data: {
        otp: token
      }
    });
  } catch (err) {
    sendWSResponse(ws, {
      success: false,
      error: err.message
    });
  }
};

// Verifikasi OTP
exports.verifyOTP = async (ws, email, token) => {
  try {
    if (!token) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Token is required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return sendWSResponse(ws, {
        success: false,
        error: 'User not found'
      });
    }

    if (!user.secret2faSurfebe) {
      return sendWSResponse(ws, {
        success: false,
        error: 'User does not have 2FA secret configured'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret2faSurfebe,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 step before/after for time drift
    });

    sendWSResponse(ws, {
      success: true,
      data: {
        verified
      }
    });
  } catch (err) {
    sendWSResponse(ws, {
      success: false, 
      error: err.message
    });
  }
};