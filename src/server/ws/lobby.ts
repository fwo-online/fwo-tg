import type { Server, Socket } from '@/server/ws';

export const onConnection = (io: Server, socket: Socket) => {
  const { character } = socket.data;

  socket.on('lobby:enter', () => {
    socket.join('lobby');
    io.to('lobby').emit('lobby:enter', character.toPublicObject());
  });

  socket.on('lobby:leave', () => {
    socket.leave('lobby');
    io.to('lobby').emit('lobby:leave', character.toPublicObject());
  });
};
