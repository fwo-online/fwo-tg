import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ServerToClientMessage } from '@fwo/schemas';
import type { Context } from 'hono';
import type { CharacterEnv } from '../middlewares';

export type WebSocketEnv = CharacterEnv & {
  Variables: {
    ws: WebSocketHelper;
  };
};

export interface WebSocketContext<E extends WebSocketEnv = WebSocketEnv> extends Context<E> {}

export class WebSocketContext<E extends WebSocketEnv = WebSocketEnv> {
  constructor(c: Context<E>) {
    Object.assign(this, c);
  }

  publish(topic: string, message: ServerToClientMessage) {
    this.get('ws').publish(topic, message);
  }

  send(message: ServerToClientMessage) {
    this.get('ws').send(message);
  }

  subscribe(channel: string) {
    this.get('ws').raw.subscribe(channel);
  }

  unsubscribe(channel: string) {
    this.get('ws').raw.unsubscribe(channel);
  }
}
