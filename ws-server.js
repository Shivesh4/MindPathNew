import { WebSocketServer } from 'ws';
import { verifyToken } from './src/lib/auth/jwt.js';

// In-memory map of userId -> Set<WebSocket>
const clients = new Map();

const wss = new WebSocketServer({ port: 3001 });

console.log('[ws] WebSocket server listening on ws://localhost:3001');

wss.on('connection', (ws, req) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token') || '';
    const decoded = verifyToken(token);

    if (!decoded?.id) {
      console.warn('[ws] Unauthorized connection attempt');
      ws.close(4001, 'Unauthorized');
      return;
    }

    const userId = decoded.id;
    console.log('[ws] Client connected:', userId);

    let set = clients.get(userId);
    if (!set) {
      set = new Set();
      clients.set(userId, set);
    }
    set.add(ws);

    ws.on('message', (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (payload?.type === 'message' && payload.contactId && payload.content) {
        const toUserId = payload.contactId;
        const content = String(payload.content);
        const timestamp = new Date().toISOString();

        const messagePayload = JSON.stringify({
          type: 'message',
          fromUserId: userId,
          toUserId,
          content,
          timestamp,
        });

        const recipients = clients.get(toUserId);
        if (recipients) {
          for (const client of recipients) {
            if (client.readyState === client.OPEN) {
              client.send(messagePayload);
            }
          }
        }
      }
    });

    ws.on('close', () => {
      const set = clients.get(userId);
      if (set) {
        set.delete(ws);
        if (set.size === 0) {
          clients.delete(userId);
        }
      }
      console.log('[ws] Client disconnected:', userId);
    });
  } catch (err) {
    console.error('[ws] Connection error:', err);
    ws.close(1011, 'Internal error');
  }
});


