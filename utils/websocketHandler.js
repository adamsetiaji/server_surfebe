  // utils/websocketHandler.js
  const userController = require('../controllers/userController');
  const recaptchaController = require('../controllers/recaptchaController');
  
  const websocketHandler = (ws) => {
    ws.on('message', async (message) => {
      try {
        const { type, action, data, email, siteKey } = JSON.parse(message);
  
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
  
          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: error.message }));
      }
    });
  };
  
  module.exports = websocketHandler;