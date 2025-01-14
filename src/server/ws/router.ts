import type { ClientToServerMessage } from '@fwo/schemas';
import type { Context } from 'hono';
import { type WebSocketEnv, WebSocketContext } from './context';
import { set } from 'es-toolkit/compat';
import type { WebSocketRoute } from './route';

export class WebSocketRouter {
  private context: WebSocketContext;
  private static openHandlers: Array<(c: WebSocketContext) => void> = [];
  private static closeHandlers: Array<(c: WebSocketContext) => void> = [];
  private static listeners: Partial<
    Record<string, Record<string, (c: WebSocketContext, message: ClientToServerMessage) => void>>
  > = {};

  constructor(context: Context<WebSocketEnv>) {
    this.context = new WebSocketContext(context);
  }

  static route<E extends WebSocketEnv, T extends ClientToServerMessage['type']>(
    route: WebSocketRoute<E, T>,
  ) {
    route.register(WebSocketRouter);

    return this;
  }

  static on<E extends WebSocketEnv>(
    type: string,
    action: string,
    listener: (context: WebSocketContext<E>, message: ClientToServerMessage) => void,
  ) {
    set(WebSocketRouter.listeners, [type, action], listener);

    return this;
  }

  async onMessage(message: ClientToServerMessage) {
    const listener = WebSocketRouter.listeners[message.type]?.[message.action];

    listener?.(this.context, message);
  }

  static open<E extends WebSocketEnv>(openHandler: (c: WebSocketContext<E>) => void) {
    WebSocketRouter.openHandlers.push(openHandler);

    return this;
  }

  static close<E extends WebSocketEnv>(closeHandler: (c: WebSocketContext<E>) => void) {
    WebSocketRouter.closeHandlers.push(closeHandler);

    return this;
  }

  async onOpen() {
    for await (const openHandler of WebSocketRouter.openHandlers) {
      await openHandler(this.context);
    }
  }

  async onClosed() {
    for await (const closeHandler of WebSocketRouter.closeHandlers) {
      await closeHandler(this.context);
    }
  }
}
