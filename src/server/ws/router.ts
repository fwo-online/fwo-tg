import type { ClientToServerMessage } from '@fwo/schemas';
import type { CharacterService } from '@/arena/CharacterService';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import { LobbyModule } from './modules/lobby';
import { MatchMakingModule } from './modules/matchMaking';
import { GameModule } from './modules/game';

export class WebSocketRouter {
  ws: WebSocketHelper;
  character: CharacterService;

  constructor(ws: WebSocketHelper, character: CharacterService) {
    this.ws = ws;
    this.character = character;
  }

  static init() {
    GameModule.init();
  }

  handleClose() {
    LobbyModule.handleClose(this.character, this.ws);
  }

  handleMessage(message: ClientToServerMessage) {
    switch (message.type) {
      case 'lobby':
        LobbyModule.handleMessage(message, this.character, this.ws);
        break;
      case 'match_making':
        MatchMakingModule.handleMessage(message, this.character, this.ws);
        break;
      case 'game':
        GameModule.handleMessage(message, this.character, this.ws);
    }
  }

  handleOpen() {
    GameModule.handleOpen(this.character, this.ws);
  }
}
