import { Aura } from './aura';

export default new Aura({
  // @ts-expect-error не используется
  name: 'mediumAura',
  displayName: 'Средняя аура',
  desc: 'Создает вокруг цели среднюю ауру',
  cost: 6,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: 'self',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+4', '1d3+5', '1d2+6'],
  profList: ['m'],
});
