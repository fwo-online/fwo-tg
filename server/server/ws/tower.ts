import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import { TowerService } from '@/arena/TowerService/TowerService';
import { activeConnections } from '@/server/utils/activeConnectons';
import type { Server, Socket } from '@/server/ws';
import { keyBy } from 'es-toolkit';

const getRoom = (tower: TowerService) => {
  return `tower:${tower.id}`;
};

export const onCreate = (io: Server) => {
  TowerService.emitter.on('start', async (tower) => {
    await Promise.all(
      tower.players.map(async (id) => {
        const player = arena.characters[id];
        const socket = activeConnections.get(player.owner);
        if (socket) {
          await socket.join(getRoom(tower));
        } else {
          console.log('no connections found: ', player.id);
        }
      }),
    ).catch((e) => console.log('MM start fail:: ', e));

    io.to(getRoom(tower)).emit('tower:start', tower.id);

    tower.on('end', () => {
      io.to(getRoom(tower)).emit('tower:end');
    });
  });
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  socket.on('tower:connected', async (callback) => {
    const tower = character.currentTower;
    if (!tower) {
      return callback({ error: true, message: 'Вы не в башне' });
    }

    try {
      const players = await Promise.all(
        tower.players.map(async (id) => {
          const char = await CharacterService.getCharacterById(id);
          return char.toObject();
        }),
      );
      return callback({
        players: keyBy(players, ({ id }) => id),
        timeSpent: tower.timeSpent,
        timeLeft: tower.timeLeft,
      });
    } catch (e) {
      console.error(e);
      return callback({ error: true, message: 'Что-то пошло не так' });
    }
  });

  if (character.currentTower) {
    socket.join(getRoom(character.currentTower));
  }
};
