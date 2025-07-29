import { CronJob } from 'cron';
import arena from '@/arena';
import { broadcast } from '@/helpers/channelHelper';
import { CharModel } from '@/models/character';
import { TowerModel } from '@/models/tower';

const resetTower = async () => {
  await TowerModel.deleteMany({});
  await CharModel.updateMany({}, { lastTower: null, towerAvailable: true });
  Object.values(arena.characters).forEach((character) => {
    character.lastTower = null;
    character.towerAvailable = true;
  });
  broadcast('Cо стороны башни доносятся крики. Башня открывает свои врата');
};

CronJob.from({
  cronTime: '0 15 * * *',
  onTick: () => {
    const [currentTower] = Object.values(arena.towers);
    if (currentTower) {
      currentTower.on('end', resetTower);
    } else {
      resetTower();
    }
  },
  start: true,
  timeZone: 'Europe/Moscow',
});
