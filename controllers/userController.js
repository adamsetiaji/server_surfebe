// controllers/userController.js
const User = require('../models/User');
const { validateUser } = require('../utils/validation');

exports.createUser = async (ws, data) => {
  try {
    if (!data.name || !data.email || !data.password_surfebe) {
      return ws.send(JSON.stringify({
        error: 'Name, email and password are required'
      }));
    }
 
    // Check if email exists
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      return ws.send(JSON.stringify({
        error: 'Email already registered'
      }));
    }
 
    const user = await User.create(data);
    const createdUser = await User.findByEmail(data.email);
    ws.send(JSON.stringify({ success: true, data: createdUser }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
 };


exports.getAllUsers = async (ws) => {
  try {
    const users = await User.findAll();
    ws.send(JSON.stringify({ success: true, data: users }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
};

exports.findUserByEmail = async (email) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};


exports.getUserByEmail = async (ws, email) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return ws.send(JSON.stringify({ error: 'User not found' }));
    }
    ws.send(JSON.stringify({ success: true, data: user }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
};

exports.updateUser = async (ws, email, data) => {
  try {
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return ws.send(JSON.stringify({ error: 'User not found' }));
    }

    // Merge existing data with updates
    const updatedData = {
      ...existingUser,
      ...data
    };

    await User.updateByEmail(email, updatedData);
    const updated = await User.findByEmail(email);
    ws.send(JSON.stringify({ success: true, data: updated }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
};

exports.deleteUser = async (ws, email) => {
  try {
    const result = await User.deleteByEmail(email);
    ws.send(JSON.stringify({ success: true, data: result }));
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
};