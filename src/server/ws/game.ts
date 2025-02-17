import { noClanName } from '@/arena/ClanService';
import OrderError from '@/arena/errors/OrderError';
import type GameService from '@/arena/GameService';
import { formatMessage } from '@/arena/LogService/utils';
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
    game.on('endOrders', () => {
      io.to(getRoom(game)).emit('game:endOrders');
    });

    game.on('startRound', (e, scope) => {
      io.to(getRoom(game, scope)).emit('game:startRound', e);
    });

    game.on('endRound', ({ dead, log }) => {
      io.to(getRoom(game)).emit('game:endRound', {
        dead: dead.map((player) => player.toObject()),
        log: log.map((message) => formatMessage(message)),
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

    await socket.emit(
      'game:start',
      game.info.id,
      game.players.players.map((player) => player.toObject()),
    );

    game.on('startOrders', () => {
      socket.emit('game:startOrders', getAvailableActions(character));
    });

    game.on('preKick', ({ reason, player }) => {
      socket.emit('game:preKick', {
        reason,
        player: player.toObject(),
      });
    });

    game.on('end', async (e) => {
      socket.emit('game:end', e);
      await socket.leave(getRoom(game));
      await socket.leave(getRoom(game, character.clan?.id ?? character.id));
    });
  };

  MatchMakingService.prependListener('start', onGameStart);

  socket.on('game:order', (order, callback) => {
    const game = character.currentGame;
    const player = game?.players.getById(character.id);
    if (!game || !player) {
      return callback({ error: true, message: 'Вы не в игре' });
    }

    try {
      const { orders, proc } = character.currentGame.orders.orderAction({
        action: order.action,
        target: order.target,
        proc: order.power,
        initiator: character.id,
      });

      callback({
        error: false,
        power: proc,
        orders: orders.map(({ target, proc, action }) => ({
          action,
          target,
          power: proc,
        })),
        ...getAvailableActions(character),
      });
    } catch (e) {
      if (e instanceof OrderError) {
        callback({ error: true, message: e.message });
      } else {
        console.log('game:order', e);
      }
    }
  });

  setTimeout(() => {
    socket.emit('game:startRound', {
      round: 2,
      status: [{ id: character.id, name: character.nickname, mp: 10, en: 10, hp: 6 }],
      statusByClan: {
        [noClanName]: [{ id: character.id, name: character.nickname, hp: 6 }],
      },
    });
    socket.emit('game:startOrders', getAvailableActions(character));
    socket.emit('game:endRound', {
      dead: [],
      log: [
        '*Test 2* пытался атаковать *Воен*, но у него не оказалось оружия в руках',
        '*Воен* пытался атаковать *Test 2*, но у него не оказалось оружия в руках',
      ],
    });
  }, 1000);

  socket.on('disconnect', () => {
    MatchMakingService.off('start', onGameStart);

    if (character.gameId) {
      character.currentGame?.kick(character.id, 'run');
    }
  });
};
