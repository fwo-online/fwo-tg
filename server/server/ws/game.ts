import OrderError from '@/arena/errors/OrderError';
import ValidationError from '@/arena/errors/ValidationError';
import type GameService from '@/arena/GameService';
import MatchMakingService from '@/arena/MatchMakingService';
import ActionsHelper from '@/helpers/actionsHelper';
import type { Server, Socket } from '@/server/ws';
import { keyBy } from 'es-toolkit';
import { activeConnections } from '@/server/utils/activeConnectons';
import type { OrderResult } from '@/arena/OrderService';
import type { Player } from '@/arena/PlayersService';
import type { ClanPublic, OrderResponse } from '@fwo/shared';
import { RoundStatus } from '@/arena/RoundService';
import config from '@/arena/config';
import { normalizeGameOrders } from '@/server/utils/normalizeGameOrders';

const getRoom = (game: GameService, scope?: string) => {
  if (scope) {
    return `game:${game.info.id}:${scope}`;
  }

  return `game:${game.info.id}`;
};

export const onCreate = (io: Server) => {
  MatchMakingService.on('start', async (game) => {
    await Promise.all(
      game.players.players.map(async (player) => {
        const socket = activeConnections.get(player.owner);
        if (socket) {
          await socket.join([getRoom(game), getRoom(game, player.id)]);
        } else {
          console.log('no connections found: ', player.id);
        }
      }),
    ).catch((e) => console.log('MM start fail:: ', e));

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
        io.to(getRoom(game, player.id)).emit('game:startOrders', {
          ...ActionsHelper.buildActions(player, game),
          orders: [],
          power: player.proc,
          ordersTime: config.ordersTime,
          ordersStartTime: game.round.timestamp,
        });
      });
    });

    game.on('preKick', ({ reason, player }) => {
      io.to(getRoom(game, player.id)).emit('game:preKick', { reason, player: player.toObject() });
    });

    game.on('end', () => {
      io.in(getRoom(game)).emit('game:end');
      game.players.players.forEach((player) => {
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
    const player = game?.players.getById(character.id);

    if (!game || !player) {
      return callback({ error: true, message: 'Вы не в игре' });
    }

    const players = keyBy(
      game.players.players.map((player) => player.toObject()),
      ({ id }) => id,
    );
    const clans = Object.values(players).reduce<Record<string, ClanPublic>>((acc, { clan }) => {
      if (clan) {
        acc[clan.id] = clan;
      }
      return acc;
    }, {});

    // todo нужно проверять, что все игроки подключились
    callback({ players, clans });

    socket.emit('game:startRound', { status: game.getStatus(), round: game.round.count });

    if (game.round.status === RoundStatus.START_ORDERS && player.alive) {
      socket.emit('game:startOrders', {
        ...ActionsHelper.buildActions(player, game),
        orders: normalizeGameOrders(game.orders.getPlayerOrders(player.id)),
        power: player.proc,
        ordersTime: config.ordersTime,
        ordersStartTime: game.round.timestamp,
      });
    }
  });

  const handleOrder = (fn: (game: GameService, player: Player) => OrderResult): OrderResponse => {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);
    if (!game || !player) {
      return { error: true, message: 'Вы не в игре' };
    }

    try {
      const { orders, proc } = fn(game, player);
      return {
        error: false,
        power: proc,
        orders: normalizeGameOrders(orders),
        ...ActionsHelper.buildActions(player, game),
      } as const;
    } catch (e) {
      if (e instanceof OrderError || e instanceof ValidationError) {
        return { error: true, message: e.message };
      }
      console.log('game:order', e);
      return { error: true, message: 'Неизвестная ошибка' };
    }
  };

  socket.on('game:orderRepeat', (callback) => {
    callback(handleOrder((game, player) => game.orders.repeatLastOrder(player.id)));
  });

  socket.on('game:orderReset', (callback) => {
    callback(handleOrder((game, player) => game.orders.resetOrdersForPlayer(player.id)));
  });

  socket.on('game:orderRemove', (orderID, callback) => {
    callback(handleOrder((game, player) => game.orders.removeAction(player.id, orderID)));
  });

  socket.on('game:order', (order, callback) => {
    callback(
      handleOrder((game, player) =>
        game.orders.orderAction({
          action: order.action,
          target: order.target,
          proc: order.power,
          initiator: player.id,
        }),
      ),
    );
  });

  if (character.currentGame) {
    const player = character.currentGame.players.getById(character.id);
    if (player) {
      socket.join([getRoom(character.currentGame), getRoom(character.currentGame, player.id)]);
    }
  }
};
