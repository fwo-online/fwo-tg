import type { CharacterService } from '@/arena/CharacterService';
import ActionsHelper from '@/helpers/actionsHelper';
import type { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ClientToServerMessage } from '@fwo/schemas';

export const game = (
  message: ClientToServerMessage,
  character: CharacterService,
  ws: WebSocketHelper,
) => {
  const game = character.currentGame;

  console.assert(game, 'ws game: game not found');
  if (!game) {
    return;
  }
  const player = game.players.getById(character.id);

  console.assert(player, 'ws game: player %s not found', character.id);
  if (!player) {
    return;
  }

  switch (message.action) {
    case 'order':
      game.orders.orderAction({
        initiator: character.id,
        target: message.order.target,
        action: message.order.action,
        proc: message.order.proc,
      });

      ws.send({
        type: 'game',
        action: 'order',
        proc: player.proc,
        actions: ActionsHelper.getBasicActions(player, game),
        magics: ActionsHelper.getAvailableMagics(player, game),
        skills: ActionsHelper.getAvailableSkills(player, game),
      });
      break;
    default:
  }
};
