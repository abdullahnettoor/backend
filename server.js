const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const users = new Map();
const games = new Map();
const waitingPlayers = new Set();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    const userId = uuidv4();
    console.log('Client connected:', userId);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(ws, userId, message);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    ws.on('close', () => handleDisconnect(userId));

    // Send initial connection success
    ws.send(JSON.stringify({
      type: 'connected',
      userId: userId
    }));
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

function handleMessage(ws, userId, message) {
  switch (message.type) {
    case 'register':
      registerUser(ws, userId, message.username);
      break;
    case 'findGame':
      findGame(userId);
      break;
    case 'move':
      handleMove(userId, message.row, message.col);
      break;
  }
}

function registerUser(ws, userId, username) {
  users.set(userId, { ws, username, status: 'online' });
  broadcastUserCount();
}

function handleDisconnect(userId) {
  if (users.has(userId)) {
    users.delete(userId);
    waitingPlayers.delete(userId);
    broadcastUserCount();
  }
}

function broadcastUserCount() {
  const count = users.size;
  for (const user of users.values()) {
    user.ws.send(JSON.stringify({
      type: 'userCount',
      count
    }));
  }
} 