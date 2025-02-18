// utils/websocketHandler.js
const userController = require('../controllers/userController');
const recaptchaController = require('../controllers/recaptchaController');
const twofaController = require('../controllers/twofaController');
const surfebeController = require('../controllers/surfebeController');


const websocketHandler = (ws) => {
  ws.on('message', async (message) => {
    try {
      const { type, action, data, email, siteKey, version, taskKey, OTPtoken } = JSON.parse(message);

      switch (type) {
        case 'USER':
          switch (action) {
            case 'CREATE':
              await userController.createUser(ws, data);
              break;
            case 'GET_ALL':
              await userController.getAllUsers(ws);
              break;
            case 'GET_BY_EMAIL':
              await userController.getUserByEmail(ws, email);
              break;
            case 'UPDATE':
              await userController.updateUser(ws, email, data);
              break;
            case 'DELETE':
              await userController.deleteUser(ws, email);
              break;
            default:
              ws.send(JSON.stringify({ error: 'Unknown user action' }));
          }
          break;

        case 'RECAPTCHA':
          switch (action) {
            case 'CREATE':
              await recaptchaController.createRecaptcha(ws, data);
              break;
            case 'GET_ALL':
              await recaptchaController.getAllRecaptchas(ws);
              break;
            case 'GET_TOKEN':
              await recaptchaController.getRecaptchaToken(ws);
              break;
            case 'GET_BY_SITE_KEY':
              await recaptchaController.getRecaptchaBySiteKey(ws, siteKey);
              break;
            case 'UPDATE':
              await recaptchaController.updateRecaptcha(ws, siteKey, data);
              break;
            case 'DELETE':
              await recaptchaController.deleteRecaptcha(ws, siteKey);
              break;
            default:
              ws.send(JSON.stringify({ error: 'Unknown recaptcha action' }));
          }
          break;

        case 'OTP':
          switch (action) {
            case 'GENERATE':
              await twofaController.generateOTP(ws, email);
              break;
            case 'VERIFY':
              await twofaController.verifyOTP(ws, email, OTPtoken);
              break;
            default:
              ws.send(JSON.stringify({ error: 'Unknown OTP action' }));
          }
          break;

        case 'SURFEBE':
          switch (action) {
            case 'REGISTER_SURFEBE':
              await surfebeController.registerSurfebe(ws, email, siteKey);
              break;
            case 'LOGIN_SURFEBE':
              await surfebeController.loginSurfebe(ws, email, siteKey);
              break;

            case 'CONFIRM_CAPTCHA_SURFEBE':
              await surfebeController.confirmCaptchaSurfebe(ws, email, siteKey);
              break;

            case 'PROFILE_SURFEBE':
              await surfebeController.getProfileSurfebe(ws, email);
              break;

            case 'GET_TASKS':
              await surfebeController.getTasks(ws, version, email);
              break;
            case 'COMPLETE_VISIT':
              await surfebeController.completeVisit(ws, version, taskKey, email);
              break;
            default:
              ws.send(JSON.stringify({ error: 'Unknown surfebe action' }));
          }
          break;


        default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    // Clean up any active timers for this connection
    recaptchaController.cleanupTimers(ws);
  });

};

module.exports = websocketHandler;