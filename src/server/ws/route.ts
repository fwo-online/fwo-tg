import type { ClientToServerMessage } from '@fwo/schemas';
import type { WebSocketContext, WebSocketEnv } from './context';
import type { WebSocketRouter } from './router';
import { forEach } from 'es-toolkit/compat';

export class WebSocketRoute<
  E extends WebSocketEnv = WebSocketEnv,
  T extends ClientToServerMessage['type'] = ClientToServerMessage['type'],
> {
  type: T;
  private openHandler?: (c: WebSocketContext<E>) => void;
  private closeHandler?: (c: WebSocketContext<E>) => void;
  private listeners: Record<
    string,
    (c: WebSocketContext<E>, message: ClientToServerMessage) => void
  > = {};

  constructor(type: T) {
    this.type = type;
  }

  register(router: typeof WebSocketRouter) {
    forEach(this.listeners, (listener, action) => {
      router.on(this.type, action, listener);
    });

    if (this.openHandler) {
      router.open(this.openHandler);
    }
    if (this.closeHandler) {
      router.close(this.closeHandler);
    }
  }

  on<K extends Extract<ClientToServerMessage, { type: T }>['action']>(
    action: K,
    listener: (
      c: WebSocketContext<E>,
      message: Extract<ClientToServerMessage, { action: K; type: T }>,
    ) => void,
  ) {
    this.listeners[action] = listener;

    return this;
  }

  open(openHandler: (c: WebSocketContext<E>) => void) {
    this.openHandler = openHandler;

    return this;
  }

  close(closeHandler: (c: WebSocketContext<E>) => void) {
    this.closeHandler = closeHandler;

    return this;
  }
}
