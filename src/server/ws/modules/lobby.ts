import type { CharacterService } from '@/arena/CharacterService';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ClientToServerMessage } from '@fwo/schemas';

export const lobby = (
  message: ClientToServerMessage,
  character: CharacterService,
  ws: WebSocketHelper,
) => {
  if (message.type !== 'lobby') {
    return;
  }

  switch (message.action) {
    case 'enter':
      ws.raw.subscribe(message.type);
      ws.raw.subscribe('match_making');
      ws.publish({ ...message, data: character.toPublicObject() });
      break;
    case 'leave':
      ws.raw.unsubscribe(message.type);
      ws.raw.unsubscribe('match_making');
      ws.publish({ ...message, data: character.toPublicObject() });
      break;
    default:
  }
};
