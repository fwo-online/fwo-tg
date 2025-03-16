import { Aura } from './aura';

export default new Aura({
  name: 'smallAura',
  displayName: 'Малая аура',
  desc: 'Создает вокруг цели слабую ауру',
  cost: 3,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: 'self',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['m'],
});
