// controllers/recaptchaController.js
const Recaptcha = require('../models/Recaptcha');
const axios = require('axios');
const { validateRecaptcha } = require('../utils/validation');

const sendWSResponse = (ws, response) => {
  ws.send(JSON.stringify(response));
};

const handleError = (ws, error) => {
  console.error('Error:', error);
  sendWSResponse(ws, {
    success: false,
    error: error.message || 'An error occurred'
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

exports.getRecaptchaBySiteKey = async (siteKey) => {
  try {
    const recaptcha = await Recaptcha.findBySiteKey(siteKey);
    if (!recaptcha) {
      return { success: false, error: 'Recaptcha not found' };
    }

    if (recaptcha.status_g_response === false) {
      return { success: false, error: 'Recaptcha false, Please Waiting' };
    }
    if (recaptcha.status_g_response === true) {
      return { success: true, data: recaptcha };
    }

  } catch (err) {
    return { success: false, error: err.message };
  }
};

exports.getAllRecaptchas = async (ws) => {
  try {
    const recaptcha = await Recaptcha.findAll();
    ws.send(JSON.stringify({ success: true, data: recaptcha }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
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

async function updateTokenRecaptcha(ws, g_response) {
  if (!g_response) {
    return { success: false, error: 'g_response is required' };
  }

  // Get existing recaptcha data first
  const existing = await Recaptcha.findBySiteKey(process.env.SITEKEY);
  if (!existing) {
    return { success: false, error: 'Recaptcha not found' };
  }

  const updateData = {
    ...existing, // Keep all existing data
    g_response: g_response,
    status_g_response: 1,
    time_g_response: "00:01:40",
    site: existing.site // Keep existing site
  };

  try {
    console.log('Updating with data:', updateData);
    
    await Recaptcha.updateBySiteKey(process.env.SITEKEY, updateData);
    return { success: true, data: updateData };
  } catch (err) {
    console.error('Update error:', err);
    return { success: false, error: err.message };
  }
}


exports.getRecaptchaToken = async (ws) => {
  try {
    // Create task request
    const createTaskResponse = await axios.post(process.env.BASE_URL_CREATE_TASK, {
      clientKey: process.env.RECAPTCHA_CLIENT_KEY
    });

    if (!createTaskResponse.data.success) {
      return sendWSResponse(ws, {
        success: false,
        error: 'Failed to create recaptcha task'
      });
    }

    const taskId = createTaskResponse.data.taskId;

    async function getRecaptchaResult(taskId) {
      while (true) {
        const resultResponse = await axios.post(process.env.BASE_URL_GET_TASK_RESULT, {
          clientKey: process.env.RECAPTCHA_CLIENT_KEY,
          taskId: taskId
        });

        const { status, success, solution } = resultResponse.data;

        // If still processing, wait and continue
        if (status === 'processing') {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        // If completed but no success (false result)
        if (status === 'completed' && !solution) {
          // Create a new task and start over
          const newTaskResponse = await axios.post(process.env.BASE_URL_CREATE_TASK, {
            clientKey: process.env.RECAPTCHA_CLIENT_KEY
          });
          
          if (!newTaskResponse.data.success) {
            throw new Error('Failed to create new recaptcha task');
          }
          
          // Recursive call with new taskId
          return getRecaptchaResult(newTaskResponse.data.taskId);
        }

        // If we have a valid result
        if (status === 'completed' && solution && solution.gRecaptchaResponse) {
          return resultResponse.data;
        }

        // If something unexpected happened
        throw new Error('Unexpected response from recaptcha service');
      }
    }

    try {
      const result = await getRecaptchaResult(taskId);

      // Update token in database
      const updateResult = await updateTokenRecaptcha(ws, result.solution.gRecaptchaResponse);
      
      if (!updateResult.success) {
        return sendWSResponse(ws, {
          success: false,
          error: 'Failed to update recaptcha status in database',
          message: updateResult.error
        });
      }

      return sendWSResponse(ws, {
        success: true,
        message: "Database Recaptcha Updated",
        data: {
          updateData: updateResult.data,
          timestamp: result.timestamp
        }
      });

    } catch (err) {
      return sendWSResponse(ws, {
        success: false,
        error: err.message || 'Failed to get recaptcha token'
      });
    }

  } catch (err) {
    handleError(ws, err);
  }
};