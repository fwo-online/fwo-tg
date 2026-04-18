import arena from '@/arena';
import { TowerService } from '@/arena/TowerService/TowerService';
import { broadcast } from '@/helpers/channelHelper';
import { CharModel } from '@/models/character';
import { TowerModel } from '@/models/tower';

export async function createTower(players: string[]) {
  const lvl = await TowerModel.getMaxLvl();
  const newTower = new TowerService(players, lvl + 1);
  const tower = await newTower.createTower();
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

const resetTower = async () => {
  const res = await TowerModel.deleteMany({});
  await CharModel.updateMany({}, { lastTower: null, towerAvailable: true });
  Object.values(arena.characters).forEach((character) => {
    character.lastTower = null;
    character.towerAvailable = true;
  });

  if (res.deletedCount) {
    broadcast('Cо стороны башни доносятся крики. Башня открывает свои врата');
  }
};

export const scheduleResetTower = async () => {
  await Bun.cron('@dayly', () => {
    const [currentTower] = Object.values(arena.towers);
    if (currentTower) {
      currentTower.on('end', resetTower);
    } else {
      resetTower();
    }
  });
};
