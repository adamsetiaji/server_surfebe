// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', (req, res) => {
  userController.createUser(res, req.body);
});

router.get('/', (req, res) => {
  userController.getAllUsers(res);
});

router.get('/:email', (req, res) => {
  userController.getUserByEmail(res, req.params.email);
});

router.put('/:email', (req, res) => {
  userController.updateUser(res, req.params.email, req.body);
});

router.delete('/:email', (req, res) => {
  userController.deleteUser(res, req.params.email);
});

module.exports = router;