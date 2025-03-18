import { ActionService } from '@/arena/ActionService';
import OrderError from '@/arena/errors/OrderError';
import type GameService from '@/arena/GameService';
import MatchMakingService from '@/arena/MatchMakingService';
import ActionsHelper from '@/helpers/actionsHelper';

import type { Server, Socket } from '@/server/ws';
import { keyBy } from 'es-toolkit';
import { activeConnections } from '@/server/utils/activeConnectons';

const getRoom = (game: GameService, scope?: string) => {
  if (scope) {
    return `game:${game.info.id}:${scope}`;
  }

  return `game:${game.info.id}`;
};

export const onCreate = (io: Server) => {
  MatchMakingService.on('start', (game) => {
    game.players.players.forEach((player) => {
      const connection = activeConnections.get(player.owner);
      console.log(...activeConnections.entries());
      if (connection) {
        console.log(connection);
        io.in(connection).socketsJoin([getRoom(game), getRoom(game, player.id)]);
      }
    });

    io.in(getRoom(game)).emit('game:start', game.info.id);

    game.on('endOrders', () => {
      io.to(getRoom(game)).emit('game:endOrders');
    });

    game.on('startRound', (e) => {
      // fixme отправлять полный статус только союзникам
      io.to(getRoom(game)).emit('game:startRound', e);
    });

    game.on('endRound', ({ dead }) => {
      dead.forEach((player) => {
        io.in(getRoom(game, player.id)).emit('game:end');

        io.in(getRoom(game, player.id)).socketsLeave([getRoom(game), getRoom(game, player.id)]);
      });
    });

    game.on('kick', ({ reason, player }) => {
      io.to(getRoom(game)).emit('game:kick', { reason, player: player.toObject() });
    });

    game.on('startOrders', () => {
      game.players.alivePlayers.forEach((player) => {
        io.to(getRoom(game, player.id)).emit(
          'game:startOrders',
          ActionsHelper.buildActions(player, game),
        );
      });
    });

    game.on('preKick', ({ reason, player }) => {
      io.to(getRoom(game, player.id)).emit('game:preKick', { reason, player: player.toObject() });
    });

    game.on('end', () => {
      io.to(getRoom(game)).emit('game:end');

      game.players.alivePlayers.forEach((player) => {
        io.in(getRoom(game)).socketsLeave(getRoom(game, player.id));
      });
      io.socketsLeave(getRoom(game));
    });
  });
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  socket.on('game:connected', (callback) => {
    const game = character.currentGame;

    if (!game) {
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

  socket.on('game:orderRepeat', (callback) => {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);
    if (!game || !player) {
      return callback({ error: true, message: 'Вы не в игре' });
    }
    try {
      const { orders, proc } = game.orders.repeatLastOrder(player.id);
      return callback({
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

  socket.on('game:orderReset', (callback) => {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);
    if (!game || !player) {
      return callback({ error: true, message: 'Вы не в игре' });
    }

    try {
      const { orders, proc } = game.orders.resetOrdersForPlayer(player.id);
      return callback({
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
};
