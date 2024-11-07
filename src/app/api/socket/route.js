import { Server } from 'ws';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

let wss;

// Initialize WebSocket server if not already created
if (!global.wss) {
  global.wss = new Server({ noServer: true });

  global.wss.on('connection', (ws) => {
    const userId = uuidv4();
    console.log('Client connected:', userId);

    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connected',
      userId: userId
    }));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, userId, message);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected:', userId);
      handleDisconnect(userId);
    });
  });

  wss = global.wss;
}

const users = new Map();
const games = new Map();
const waitingPlayers = new Set();

export function GET(req) {
  const headersList = headers();
  const upgrade = headersList.get('upgrade');
  const connection = headersList.get('connection');

  if (!upgrade || !connection?.includes('Upgrade') || upgrade !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 426 });
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });

  return new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade'
    }
  });
}

function handleMessage(ws, userId, message) {
  switch (message.type) {
    case 'register':
      users.set(userId, {
        ws,
        username: message.username,
        status: 'online'
      });
      broadcastUserCount();
      break;

    case 'findGame':
      findGame(userId);
      break;

    case 'move':
      handleMove(userId, message.row, message.col);
      break;
  }
}

function handleDisconnect(userId) {
  const user = users.get(userId);
  if (!user) return;

  // Handle active game disconnection
  const game = Array.from(games.values()).find(g =>
    g.players.includes(userId)
  );

  if (game) {
    const opponent = users.get(game.players.find(id => id !== userId));
    if (opponent) {
      opponent.ws.send(JSON.stringify({
        type: 'opponentLeft'
      }));
    }
    games.delete(game.id);
  }

  waitingPlayers.delete(userId);
  users.delete(userId);
  broadcastUserCount();
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
