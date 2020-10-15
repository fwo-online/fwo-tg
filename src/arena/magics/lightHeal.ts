import { Heal } from './heal';

export default new Heal({
  name: 'lightHeal',
  displayName: 'Слабое лечение',
  desc: 'Слабое лечение цели',
  cost: 3,
  baseExp: 10,
  costType: 'mp',
  lvl: 1,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d2', '1d2+1', '1d2+2'],
  profList: ['m', 'p'],
});
