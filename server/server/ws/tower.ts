import arena from '@/arena';
import { TowerService } from '@/arena/TowerService/TowerService';
import { broadcast } from '@/helpers/channelHelper';
import { activeConnections } from '@/server/utils/activeConnectons';
import type { Server } from '@/server/ws';

export const onCreate = (io: Server) => {
  TowerService.emitter.on('start', async (tower) => {
    await Promise.all(
      tower.players.map(async (id) => {
        const player = arena.characters[id];
        const socket = activeConnections.get(player.owner);
        if (socket) {
          await socket.join([`tower:${id}`]);
        } else {
          console.log('no connections found: ', player.id);
        }
      }),
    ).catch((e) => console.log('MM start fail:: ', e));

    io.in(`tower:${tower.id}`).emit('tower:start', tower.id);

    tower.on('battleStart', async () => {
      await broadcast('Вы встречаете на своём пути монстра!');
    });

    tower.on('battleEnd', async (_, win) => {
      if (win) {
        await broadcast('Вы побеждате монстра!');
      }
    });
  });
};
