import arena from '@/arena';
import type { CharacterService } from '@/arena/CharacterService';
import MatchMakingService from '@/arena/MatchMakingService';
import ActionsHelper from '@/helpers/actionsHelper';
import { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { ClientToServerMessage, GameMessage } from '@fwo/schemas';

export abstract class GameModule {
  static init() {
    const startGame = (gameID: string) => {
      const game = arena.games[gameID];
      if (!game) return;

      const handleMessage = (message: GameMessage, scope?: string) => {
        if (scope) {
          WebSocketHelper.server.publish(`${gameID}:${scope}`, JSON.stringify(message));
        } else {
          WebSocketHelper.server.publish(gameID, JSON.stringify(message));
        }
      };

      const endGame = (message: GameMessage) => {
        if (message.action === 'end') {
          game.off('game', handleMessage);
        }
      };

      game.on('game', endGame);
      game.on('game', handleMessage);
    };

    MatchMakingService.on('start', startGame);
  }

  static handleOpen(character: CharacterService, ws: WebSocketHelper) {
    const startGame = (gameID: string, players: string[]) => {
      if (!players.includes(character.id)) {
        return;
      }

      MatchMakingService.off('start', startGame);

      const game = character.currentGame;
      console.assert(game, 'ws game: game not found');
      if (!game) {
        return;
      }

      ws.raw.subscribe(gameID);
      ws.raw.subscribe(`${gameID}:${character.clan?.name ?? 'noClan'}`);

      const handleMessage = (message: GameMessage) => {
        if (message.action === 'end') {
          ws.raw.unsubscribe(gameID);
          ws.raw.unsubscribe(`${gameID}:${character.clan?.name ?? 'noClan'}`);
          game.off('game', handleMessage);
        }
        if (message.action === 'startOrders') {
          const player = game.players.getById(character.id);

          console.assert(player, 'ws game: player %s not found', character.id);
          if (!player) {
            return;
          }

          GameModule.sendAvailableActions(character, ws);
        }
      };

      game.on('game', handleMessage);
    };

    MatchMakingService.on('start', startGame);
  }

  static handleMessage(
    message: ClientToServerMessage,
    character: CharacterService,
    ws: WebSocketHelper,
  ) {
    const game = character.currentGame;

    if (!game) {
      console.log('ws game: game not found');
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

        GameModule.sendAvailableActions(character, ws);
        break;
      default:
        console.log(message);
    }
  }

  private static sendAvailableActions(character: CharacterService, ws: WebSocketHelper) {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);

    if (!game || !player) {
      console.assert(game, 'ws game: game not found');
      console.assert(player, 'ws game: player %s not found', character.id);
      return;
    }

    ws.send({
      type: 'game',
      action: 'order',
      proc: player.proc,
      actions: ActionsHelper.getBasicActions(player, game),
      magics: ActionsHelper.getAvailableMagics(player, game),
      skills: ActionsHelper.getAvailableSkills(player, game),
    });
  }
}
