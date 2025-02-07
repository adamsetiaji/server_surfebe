// controllers/recaptchaController.js
exports.createRecaptcha = async (ws, data) => {
  try {
    if (!data.site || !data.site_key) {
      return ws.send(JSON.stringify({ 
        error: 'Site and site key are required' 
      }));
    }
 
    const existingRecaptcha = await Recaptcha.findBySiteKey(data.site_key);
    if (existingRecaptcha) {
      return ws.send(JSON.stringify({
        error: 'Site key already exists'
      }));
    }
 
    await Recaptcha.create(data);
    const created = await Recaptcha.findBySiteKey(data.site_key);
    ws.send(JSON.stringify({ success: true, data: created }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
 };
 
 exports.updateRecaptcha = async (ws, siteKey, data) => {
  try {
    const existing = await Recaptcha.findBySiteKey(siteKey);
    if (!existing) {
      return ws.send(JSON.stringify({ error: 'Recaptcha not found' }));
    }
 
    const updatedData = {
      ...existing,
      ...data
    };
 
    await Recaptcha.updateBySiteKey(siteKey, updatedData);
    const updated = await Recaptcha.findBySiteKey(siteKey);
    ws.send(JSON.stringify({ success: true, data: updated }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
 };
 
 exports.deleteRecaptcha = async (ws, siteKey) => {
  try {
    const existing = await Recaptcha.findBySiteKey(siteKey);
    if (!existing) {
      return ws.send(JSON.stringify({ error: 'Recaptcha not found' }));
    }
 
    await Recaptcha.deleteBySiteKey(siteKey);
    ws.send(JSON.stringify({ 
      success: true, 
      message: 'Recaptcha deleted successfully' 
    }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
 };