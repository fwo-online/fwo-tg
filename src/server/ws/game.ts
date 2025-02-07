import type GameService from '@/arena/GameService';
import MatchMakingService from '@/arena/MatchMakingService';

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

    game.on('startOrders', () => {
      io.to(getRoom(game)).emit('game:startOrders');
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

  const onGameStart = (game: GameService) => {
    socket.join(`game:${game.info.id}`);
    socket.join(`game:${game.info.id}:${character.clan?.id}`);

    game.on('preKick', (e) => {
      socket.emit('game:preKick', e);
    });

    game.on('kick', (e) => {
      socket.emit('game:kick', e);
    });
  };

  MatchMakingService.on('start', onGameStart);

  socket.on('disconnect', () => {
    MatchMakingService.off('start', onGameStart);

    if (character.gameId) {
      character.currentGame?.kick(character.id, 'run');
    }
  });
};
