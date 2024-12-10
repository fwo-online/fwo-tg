import type { CharacterService } from '@/arena/CharacterService';
import { ChatService } from '@/arena/ChatService';
import MatchMakingService from '@/arena/MatchMakingService';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ClientToServerMessage } from '@fwo/schemas';

export const matchMaking = (
  message: ClientToServerMessage,
  character: CharacterService,
  ws: WebSocketHelper,
) => {
  if (message.type !== 'match_making') {
    return;
  }

  switch (message.action) {
    case 'start_search':
      MatchMakingService.push({ id: character.id, psr: 100, startTime: Date.now() });
      ChatService.addConnection(character.id, ws);
      ws.publish({ ...message, data: character.toPublicObject() });
      break;
    case 'stop_search':
      MatchMakingService.pull(character.id);
      ChatService.removeConnection(character.id);
      ws.publish({ ...message, data: character.toPublicObject() });

      break;
    default:
  }
};
