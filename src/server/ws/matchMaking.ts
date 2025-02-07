import MatchMakingService from '@/arena/MatchMakingService';
import type { Server, Socket } from '@/server/ws';

export const onConnection = (io: Server, socket: Socket) => {
  const { character } = socket.data;

  socket.on('matchMaking:start', () => {
    MatchMakingService.push({ id: character.id, psr: 1000, startTime: Date.now() });
    io.to('lobby').emit('matchMaking:start', character.toPublicObject());
  });

  socket.on('matchMaking:stop', () => {
    MatchMakingService.pull(character.id);
    io.to('lobby').emit('matchMaking:stop', character.toPublicObject());
  });
};
