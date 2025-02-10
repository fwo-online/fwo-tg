import { CharacterService } from '@/arena/CharacterService';
import type { Server, Socket } from '@/server/ws';
import { validateToken } from '@/server/utils/validateToken';

export const middleware = async (socket: Socket, next: (err?: Error) => void) => {
  const [type, value] = socket.handshake.headers.authorization?.split(' ') ?? [];
  try {
    const user = validateToken(type, value);
    if (!user) {
      return next(new Error('User not found'));
    }

    const character = await CharacterService.getCharacter(user.id.toString());
    if (!character) {
      return next(new Error('Character not found'));
    }

    socket.data.character = character;
    next();
  } catch (e) {
    return next(e);
  }
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  socket.on('character', async (callback) => {
    callback(character.toObject());
  });
};
