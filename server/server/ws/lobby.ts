import arena from '@/arena';
import MatchMakingService from '@/arena/MatchMakingService';
import { checkUserIsChannelMember } from '@/bot';
import type { Server, Socket } from '@/server/ws';

export const onCreate = (io: Server) => {
  MatchMakingService.on('list', (mmItems) => {
    const characters = mmItems.map(({ id }) => arena.characters[id].toPublicObject());
    io.to('lobby').emit('lobby:list', characters);
  });
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  socket.on('lobby:enter', async (callback) => {
    socket.join('lobby');
    callback(MatchMakingService.mmQueue.map(({ id }) => arena.characters[id].toPublicObject()));

    const isChannelMember = await checkUserIsChannelMember(character.owner);
    if (!isChannelMember) {
      socket.emit('lobby:help');
    }
  });

  socket.on('lobby:leave', () => {
    socket.leave('lobby');
  });

  socket.on('lobby:start', (callback) => {
    try {
      MatchMakingService.push({
        id: character.id,
        psr: character.performance.psr,
        startTime: Date.now(),
      });
      callback({});
    } catch (e) {
      if (e instanceof Error) {
        callback({ error: true, message: e.message });
      }
    }
  });

  socket.on('lobby:stop', () => {
    MatchMakingService.pull(character.id);
  });
};
