import { type Context, Hono } from 'hono';
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';
import { userMiddleware, characterMiddleware } from '@/server/middlewares';
import { WebSocketRouter } from './router';
import { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { WebSocketEnv } from './context';
import { matchMaking } from './modules/matchMaking';
import { lobby } from './modules/lobby';
import { game } from './modules/game';

const { upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

WebSocketRouter.route(lobby).route(matchMaking).route(game);

export const ws = new Hono()
  .use(userMiddleware)
  .use(characterMiddleware)
  .get(
    '/',
    upgradeWebSocket((c: Context<WebSocketEnv>) => {
      const router = new WebSocketRouter(c);

      return {
        async onOpen(_, ws) {
          if (ws.raw) {
            c.set('ws', new WebSocketHelper(ws.raw));
            router.onOpen();
          }
        },
        onMessage({ data }) {
          const message = WebSocketHelper.parse(data);

          if (message) {
            router.onMessage(message);
          }
        },
        onClose() {
          router.onClosed();
        },
      };
    }),
  );
