import { ActionService } from '@/arena/ActionService';
import OrderError from '@/arena/errors/OrderError';
import type GameService from '@/arena/GameService';
import MatchMakingService from '@/arena/MatchMakingService';
import type { Player } from '@/arena/PlayersService';
import ActionsHelper from '@/helpers/actionsHelper';

import type { Server, Socket } from '@/server/ws';
import { keyBy } from 'es-toolkit';

const getRoom = (game: GameService, scope?: string) => {
  if (scope) {
    return `game:${game.info.id}:${scope}`;
  }

  return `game:${game.info.id}`;
};

export const onCreate = (io: Server) => {
  MatchMakingService.on('start', (game) => {
    game.on('endOrders', () => {
      io.to(getRoom(game)).emit('game:endOrders');
    });

    game.on('startRound', (e) => {
      // fixme отправлять полный статус только союзникам
      io.to(getRoom(game)).emit('game:startRound', e);
    });

    game.on('endRound', ({ dead }) => {
      io.to(getRoom(game)).emit('game:endRound', {
        dead: dead.map((player) => player.toObject()),
      });
    });

    game.on('kick', ({ reason, player }) => {
      io.to(getRoom(game)).emit('game:kick', { reason, player: player.toObject() });
    });
  });
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  const onGameStart = async (game: GameService) => {
    await socket.join(getRoom(game));
    await socket.join(getRoom(game, character.clan?.id ?? character.id));

    await socket.emit('game:start', game.info.id);
    const player = game.players.getById(character.id);

    if (!player) {
      return;
    }

    const startOrders = () => {
      socket.emit('game:startOrders', ActionsHelper.buildActions(player, game));
    };

    const preKick = ({ player, reason }: { reason: string; player: Player }) => {
      if (player.id !== character.id) {
        return;
      }

      socket.emit('game:preKick', {
        reason,
        player: player.toObject(),
      });
    };

    const end = async () => {
      socket.emit('game:end');
      await socket.leave(getRoom(game));
      await socket.leave(getRoom(game, character.clan?.id ?? character.id));
    };

    game.on('startOrders', startOrders);
    game.on('preKick', preKick);
    game.on('end', end);

    socket.on('disconnect', () => {
      game.off('startOrders', startOrders);
      game.off('preKick', preKick);
      game.off('end', end);
    });
  };

  MatchMakingService.prependListener('start', onGameStart);

  socket.on('game:connected', (callback) => {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);

    if (!game || !player) {
      return callback({ error: true, message: 'Вы не в игре' });
    }
    // todo нужно проверять, что все игроки подключились
    callback({
      players: keyBy(
        game.players.players.map((player) => player.toObject()),
        ({ id }) => id,
      ),
    });
  });

  socket.on('game:order', (order, callback) => {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);
    if (!game || !player) {
      return callback({ error: true, message: 'Вы не в игре' });
    }

    try {
      const { orders, proc } = game.orders.orderAction({
        action: order.action,
        target: order.target,
        proc: order.power,
        initiator: character.id,
      });

      callback({
        error: false,
        power: proc,
        orders: orders.map(({ target, proc, action }) => ({
          action: ActionService.toObject(action),
          target,
          power: proc,
        })),
        ...ActionsHelper.buildActions(player, game),
      });
    } catch (e) {
      if (e instanceof OrderError) {
        callback({ error: true, message: e.message });
      } else {
        console.log('game:order', e);
      }
    }
  });

  socket.on('disconnect', () => {
    MatchMakingService.off('start', onGameStart);

    if (character.gameId) {
      character.currentGame?.preKick(character.id, 'run');
    }
  });
};
