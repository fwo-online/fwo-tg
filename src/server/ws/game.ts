import { noClanName } from '@/arena/ClanService';
import OrderError from '@/arena/errors/OrderError';
import type GameService from '@/arena/GameService';
import MatchMakingService from '@/arena/MatchMakingService';
import { getAvailableActions } from '@/helpers/actionsHelper';

import type { Server, Socket } from '@/server/ws';

const getRoom = (game: GameService, scope?: string) => {
  if (scope) {
    return `game:${game.info.id}:${scope}`;
  }

  return `game:${game.info.id}`;
};

export const onCreate = (io: Server) => {
  MatchMakingService.on('start', (game) => {
    game.on('start', (e) => {
      io.to(getRoom(game)).emit('game:start', e);
    });

    game.on('endOrders', () => {
      io.to(getRoom(game)).emit('game:endOrders');
    });

    game.on('startRound', (e, scope) => {
      io.to(getRoom(game, scope)).emit('game:startRound', e);
    });

    game.on('endRound', (e) => {
      io.to(getRoom(game)).emit('game:endRound', e);
    });

    game.on('kick', (e) => {
      io.to(getRoom(game)).emit('game:kick', e);
    });
  });
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  const onGameStart = async (game: GameService) => {
    await socket.join(getRoom(game));
    await socket.join(getRoom(game, character.clan?.id ?? character.id));

    await socket.to(getRoom(game)).emit('game:start', game.info.id);

    game.on('preKick', (e) => {
      socket.emit('game:preKick', e);
    });

    game.on('kick', (e) => {
      socket.emit('game:kick', e);
    });

    game.on('startOrders', () => {
      socket.emit('game:startOrders', getAvailableActions(character));
    });
  };

  MatchMakingService.prependListener('start', onGameStart);

  socket.on('game:order', (order, callback) => {
    try {
      character.currentGame?.orders.orderAction({
        action: order.action,
        target: order.target,
        proc: order.power,
        initiator: character.id,
      });

      callback({ success: true, ...getAvailableActions(character), power: 50, orders: [order] });
    } catch (e) {
      if (e instanceof OrderError) {
        callback({ success: false, message: e.message });
      } else {
        console.log('game:order', e);
      }
    }
  });

  socket.on('disconnect', () => {
    MatchMakingService.off('start', onGameStart);

    if (character.gameId) {
      character.currentGame?.kick(character.id, 'run');
    }
  });
};
