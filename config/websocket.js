// config/websocket.js
const WebSocket = require('ws');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        // Handle different message types
        switch(data.type) {
          case 'USER_ACTION':
            // Handle user actions
            break;
          case 'RECAPTCHA_ACTION':
            // Handle recaptcha actions
            break;
          default:
            ws.send(JSON.stringify({ error: 'Unknown action type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: error.message }));
      }
    });
  });

  return wss;
};

module.exports = setupWebSocket;