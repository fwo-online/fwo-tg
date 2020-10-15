import { Heal } from './heal';

export default new Heal({
  name: 'strongHeal',
  displayName: 'Сильное лечение',
  desc: 'Сильное лечение цели',
  cost: 12,
  baseExp: 10,
  costType: 'mp',
  lvl: 3,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d6+4', '1d5+5', '1d4+6'],
  profList: ['p'],
});
