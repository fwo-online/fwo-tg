import arena from '@/arena';
import { TowerService } from '@/arena/TowerService';
import { broadcast } from '@/helpers/channelHelper';
import { TowerModel } from '@/models/tower';

export async function createTower(players: string[]) {
  const lvl = await TowerModel.getMaxLvl();
  const tower = await TowerService.createTower(players, lvl + 1);

  tower.on('end', async () => {
    arena.mm.reset('tower');

    broadcast('Башня завершена');
  });

  tower.on('battleStart', async () => {
    await broadcast('Монстры нападают на путников!');
  });

  tower.on('battleEnd', async (_, win) => {
    if (win) {
      await broadcast('Монстры побеждены!');
    } else {
      await broadcast('Монстры победили путников!');
    }
  });

  return tower;
}
