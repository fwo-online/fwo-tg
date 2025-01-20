import { clientToServerMessageSchema, type ServerToClientMessage } from '@fwo/schemas';
import type { Server, ServerWebSocket } from 'bun';
import { safeParse } from 'valibot';

export class WebSocketHelper {
  public raw!: ServerWebSocket;
  static server: Server;

  constructor(ws: ServerWebSocket) {
    this.raw = ws;
  }

  static setServer(server: Server) {
    WebSocketHelper.server = server;
  }

  static parse(message: string) {
    const { output, typed, issues } = safeParse(clientToServerMessageSchema, JSON.parse(message));

    if (issues) {
      console.log(issues);
    }

    if (typed) {
      return output;
    }
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
