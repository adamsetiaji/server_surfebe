// routes/recaptchaRoutes.js
const express = require('express');
const router = express.Router();
const recaptchaController = require('../controllers/recaptchaController');

router.post('/', (req, res) => {
  recaptchaController.createRecaptcha(res, req.body);
});

router.get('/', (req, res) => {
  recaptchaController.getAllRecaptchas(res);
});

router.get('/', (req, res) => {
  recaptchaController.getRecaptcha(res);
});

router.put('/', (req, res) => {
  recaptchaController.updateRecaptcha(res, req.body);
});

router.delete('/:siteKey', (req, res) => {
  recaptchaController.deleteRecaptcha(res, req.params.siteKey);
});

module.exports = router;