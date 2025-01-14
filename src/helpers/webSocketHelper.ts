import {
  type ClientToServerMessage,
  clientToServerMessageSchema,
  type ServerToClientMessage,
} from '@fwo/schemas';
import type { Server, ServerWebSocket } from 'bun';

export class WebSocketHelper {
  public raw!: ServerWebSocket;
  static server: Server;

  constructor(ws: ServerWebSocket) {
    this.raw = ws;
  }

  static setServer(server: Server) {
    WebSocketHelper.server = server;
  }

  static parse(message: string): ClientToServerMessage | undefined {
    const { data, error } = clientToServerMessageSchema.safeParse(JSON.parse(message));

    if (error) {
      console.log(error);
    }

    return data;
  }

  setWs(ws: ServerWebSocket) {
    this.raw = ws;
  }

  send(message: ServerToClientMessage) {
    return this.raw.send(JSON.stringify(message));
  }

  // broadcast(message: ServerToClientMessage) {
  //   WebSocketHelper.server.publish(message.type, JSON.stringify(message));
  // }

  publish(topic: string, message: ServerToClientMessage) {
    WebSocketHelper.server.publish(topic, JSON.stringify(message));
  }

  static publish(topic: string, message: ServerToClientMessage) {
    WebSocketHelper.server.publish(topic, JSON.stringify(message));
  }
}
