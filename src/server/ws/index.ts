import { type Context, Hono } from 'hono';
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';
import { userMiddleware, characterMiddleware, type CharacterEnv } from '@/server/middlewares';
import { createWsRouter } from './router';
import { WebSocketHelper } from '@/helpers/webSocketHelper';

export const { upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

export const ws = new Hono()
  .use(userMiddleware)
  .use(characterMiddleware)
  .get(
    '/',
    upgradeWebSocket((c: Context<CharacterEnv>) => {
      const webSocketHelper = new WebSocketHelper();

      const router = createWsRouter(webSocketHelper, c.get('character'));

      return {
        async onOpen(_, ws) {
          if (ws.raw) {
            webSocketHelper.setWs(ws.raw);
          }
        },
        onMessage({ data }) {
          const message = WebSocketHelper.read(data);

          if (message) {
            router(message);
          }
        },
      };
    }),
  );
