import { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ServerToClientMessage } from '@fwo/schemas';
import type PlayersService from './PlayersService/PlayersService';

export class ChatService {
  static connections = new Map<string, WebSocketHelper>();
  private playersService: PlayersService;
  private room: string;

  constructor(gameID: string, playersService: PlayersService) {
    this.room = `game_${gameID}`;
    this.playersService = playersService;
    this.subscribe();
  }

  static addConnection(id: string, ws: WebSocketHelper) {
    ChatService.connections.set(id, ws);
  }

  static removeConnection(id: string) {
    ChatService.connections.delete(id);
  }

  private subscribe() {
    this.playersService.players.forEach(({ id }) => {
      const ws = ChatService.connections.get(id);
      if (!ws) {
        // TODO handle no connection
        return;
      }
      ws.raw.subscribe(this.getRoom());
      const clanID = this.playersService.getById(id)?.clan?.id ?? 'empty';
      ws.raw.subscribe(this.getRoom(clanID));
    });
  }

  unsubscribe(id: string) {
    const ws = ChatService.connections.get(id);
    ws?.raw.unsubscribe(this.getRoom());
    const clanID = this.playersService.getById(id)?.clan?.id ?? 'empty';
    ws?.raw.unsubscribe(this.getRoom(clanID));
  }

  getRoom(clanID = '') {
    return this.room + clanID;
  }

  send(id: string, message: ServerToClientMessage) {
    ChatService.connections.get(id)?.send(message);
  }

  sendToClan(clanID: string, message: ServerToClientMessage) {
    WebSocketHelper.server.publish(this.getRoom(clanID), JSON.stringify(message));
  }

  sendToAll(message: ServerToClientMessage) {
    WebSocketHelper.server.publish(this.getRoom(), JSON.stringify(message));
  }
}
