import { Heal } from './heal';

export default new Heal({
  name: 'mediumHeal',
  displayName: 'Среднее лечение',
  desc: 'Среднее лечение цели',
  cost: 6,
  baseExp: 10,
  costType: 'mp',
  lvl: 2,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['p'],
});
