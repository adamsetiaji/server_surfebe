const Recaptcha = require('../models/Recaptcha');
const { validateRecaptcha } = require('../utils/validation');

// Helper function to send WebSocket response
const sendWSResponse = (ws, data) => {
  ws.send(JSON.stringify(data));
};

// Helper function for error handling
const handleError = (ws, error) => {
  console.error('Recaptcha Controller Error:', error);
  sendWSResponse(ws, {
    success: false,
    error: error.message || 'An unexpected error occurred'
  });
};

exports.createRecaptcha = async (ws, data) => {
  try {
    // Validate input data
    const validationError = validateRecaptcha(data);
    if (validationError) {
      return sendWSResponse(ws, { 
        success: false,
        error: validationError 
      });
    }

    // Check for existing recaptcha
    const existingRecaptcha = await Recaptcha.findBySiteKey(data.site_key);
    if (existingRecaptcha) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Site key already exists'
      });
    }

    // Create new recaptcha
    const sanitizedData = {
      site: data.site.trim(),
      site_key: data.site_key.trim(),
      settings: data.settings || {},
      created_at: new Date(),
      updated_at: new Date()
    };

    await Recaptcha.create(sanitizedData);
    const created = await Recaptcha.findBySiteKey(data.site_key);
    
    sendWSResponse(ws, { 
      success: true, 
      data: created 
    });
  } catch (err) {
    handleError(ws, err);
  }
};

exports.updateRecaptcha = async (ws, siteKey, data) => {
  try {
    if (!siteKey) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Site key is required'
      });
    }

    // Validate update data
    const validationError = validateRecaptcha(data, true); // true for update mode
    if (validationError) {
      return sendWSResponse(ws, {
        success: false,
        error: validationError
      });
    }

    // Check if recaptcha exists
    const existing = await Recaptcha.findBySiteKey(siteKey);
    if (!existing) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Recaptcha not found'
      });
    }

    // Prepare update data
    const updatedData = {
      ...existing,
      ...data,
      updated_at: new Date()
    };

    // Remove any undefined or null values
    Object.keys(updatedData).forEach(key => 
      (updatedData[key] === undefined || updatedData[key] === null) && delete updatedData[key]
    );

    await Recaptcha.updateBySiteKey(siteKey, updatedData);
    const updated = await Recaptcha.findBySiteKey(siteKey);
    
    sendWSResponse(ws, {
      success: true,
      data: updated
    });
  } catch (err) {
    handleError(ws, err);
  }
};

exports.deleteRecaptcha = async (ws, siteKey) => {
  try {
    if (!siteKey) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Site key is required'
      });
    }

    // Check if recaptcha exists
    const existing = await Recaptcha.findBySiteKey(siteKey);
    if (!existing) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Recaptcha not found'
      });
    }

    await Recaptcha.deleteBySiteKey(siteKey);
    
    sendWSResponse(ws, {
      success: true,
      message: 'Recaptcha deleted successfully'
    });
  } catch (err) {
    handleError(ws, err);
  }
};

// Add method to get recaptcha by site key
exports.getRecaptcha = async (ws, siteKey) => {
  try {
    if (!siteKey) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Site key is required'
      });
    }

    const recaptcha = await Recaptcha.findBySiteKey(siteKey);
    if (!recaptcha) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Recaptcha not found'
      });
    }

    sendWSResponse(ws, {
      success: true,
      data: recaptcha
    });
  } catch (err) {
    handleError(ws, err);
  }
};
