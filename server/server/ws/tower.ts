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
      tower.characters.map(async (character) => {
        const socket = activeConnections.get(character.owner);
        if (socket) {
          await socket.join(getRoom(tower));
        } else {
          console.log('no connections found: ', character.id);
        }
      }),
    ).catch((e) => console.log('MM start fail:: ', e));

    io.to(getRoom(tower)).emit('tower:start', tower.id);

    tower.on('end', () => {
      io.to(getRoom(tower)).emit('tower:end');
    });

    tower.on('updateTime', (timeSpent, timeLeft) => {
      io.to(getRoom(tower)).emit('tower:updateTime', timeSpent, timeLeft);
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
      return callback({
        players: keyBy(
          tower.characters.map((character) => character.toObject()),
          ({ id }) => id,
        ),
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
