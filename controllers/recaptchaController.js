// controllers/recaptchaController.js
const Recaptcha = require('../models/Recaptcha');
const axios = require('axios');
const { validateRecaptcha } = require('../utils/validation');
const RecaptchaTimer = require('../utils/timerController');
const timers = new Map();


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

function cleanupTimers(ws) {
  for (const [siteKey, timer] of timers.entries()) {
    if (timer.ws === ws) {
      timer.stop();
      timers.delete(siteKey);
    }
  }
}

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

exports.getAllRecaptchas = async (ws) => {
  try {
    const recaptcha = await Recaptcha.findAll();
    ws.send(JSON.stringify({ success: true, data: recaptcha }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
};

exports.getRecaptcha = async (ws) => {
  try {
    const siteKey = process.env.SITEKEY;

    const recaptcha = await Recaptcha.findBySiteKey(siteKey);
    if (!recaptcha) {
      // Jika ws ada, kirim response melalui WebSocket
      if (ws) {
        return sendWSResponse(ws, {
          success: false,
          error: 'Recaptcha not found'
        });
      }
      // Jika tidak ada ws, return object response
      return {
        success: false,
        error: 'Recaptcha not found'
      };
    }

    // Jika ws ada, kirim response melalui WebSocket
    if (ws) {
      sendWSResponse(ws, {
        success: true,
        data: recaptcha
      });
    }
    // Return object response
    return {
      success: true,
      data: recaptcha
    };
  } catch (err) {
    if (ws) {
      handleError(ws, err);
    }
    return {
      success: false,
      error: err.message
    };
  }
};

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

async function updateTokenRecaptcha(ws, g_response) {
  if (!g_response) {
    return { success: false, error: 'g_response is required' };
  }

  const siteKey = process.env.SITEKEY;
  
  // Get existing recaptcha data first
  const existing = await Recaptcha.findBySiteKey(siteKey);
  if (!existing) {
    return { success: false, error: 'Recaptcha not found' };
  }

  const updateData = {
    ...existing,
    g_response: g_response,
    status_g_response: true,
    time_g_response: "00:01:40",
    site: existing.site
  };

  try {
    await Recaptcha.updateBySiteKey(siteKey, updateData);
    
    // Stop existing timer if any
    if (timers.has(siteKey)) {
      timers.get(siteKey).stop();
    }
    
    // Create and start new timer
    const timer = new RecaptchaTimer(ws, siteKey);
    timers.set(siteKey, timer);
    timer.startTimer("00:01:40");
    
    return { 
      type: 'RECAPTCHA',
      action: 'UPDATE',
      success: true, 
      data: updateData 
    };
  } catch (err) {
    console.error('Update error:', err);
    return { 
      type: 'RECAPTCHA',
      action: 'UPDATE',
      success: false, 
      error: err.message 
    };
  }
}

exports.updateRecaptcha = async (ws, data) => {
  try {
    const siteKey = process.env.SITEKEY


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


exports.updateTokenRecaptcha = updateTokenRecaptcha;
exports.cleanupTimers = cleanupTimers;

