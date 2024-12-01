import { Context, Hono } from 'hono';
import { createBunWebSocket } from 'hono/bun';
import { ServerWebSocket } from 'bun';
import { userMiddleware, UserEnv } from '@/server/middlewares/userMiddleware';
import { setInterval } from 'timers/promises';

export const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

export const battle = new Hono().use(userMiddleware).get(
  '/',
  upgradeWebSocket((c: Context<UserEnv>) => {
    c.get('user');
    let intervalId;
    return {
      async onOpen(_, ws) {
        for await (const startTime of setInterval(2000, Date.now())) {
          ws.send(new Date().toString());
        }
      },
      onClose() {
        clearInterval(intervalId);
      },
    };
  }),
);
