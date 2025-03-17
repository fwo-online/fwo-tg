import { CharacterService } from '@/arena/CharacterService';
import type { Server, Socket } from '@/server/ws';
import { validateToken } from '@/server/utils/validateToken';

const activeConnections = new Set<string>();

export const middleware = async (socket: Socket, next: (err?: Error) => void) => {
  const [type, value] = socket.handshake.headers.authorization?.split(' ') ?? [];
  try {
    const user = validateToken(type, value);
    if (!user) {
      return next(new Error('User not found'));
    }

    if (!activeConnections.has(user.id.toString())) {
      activeConnections.add(user.id.toString());

      socket.on('disconnect', () => {
        activeConnections.delete(user.id.toString());
      });

      socket.on('error', () => {
        activeConnections.delete(user.id.toString());
      });
    } else {
      return next(new Error('No multiple connections'));
    }

    const character = await CharacterService.getCharacter(user.id.toString());
    if (!character) {
      return next(new Error('Character not found'));
    }

    socket.data.character = character;
    next();
  } catch (e) {
    if (e instanceof Error) {
      return next(e);
    }

    console.log(e);
  }
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  socket.on('character', async (callback) => {
    callback(character.toObject());
  });
};
