import type { ClientToServerMessage } from '@fwo/schemas';
import type { CharacterService } from '@/arena/CharacterService';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import { lobby } from './modules/lobby';
import { matchMaking } from './modules/matchMaking';
import { game } from './modules/game';

export const createWsRouter = (ws: WebSocketHelper, character: CharacterService) => {
  return (message: ClientToServerMessage) => {
    switch (message.type) {
      case 'lobby':
        lobby(message, character, ws);
        break;
      case 'match_making':
        matchMaking(message, character, ws);
        break;
      case 'game':
        game(message, character, ws);
    }
  };
};
