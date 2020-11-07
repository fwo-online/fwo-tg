import { Aura } from './aura';

export default new Aura({
  // @ts-expect-error не используется
  name: 'strongAura',
  displayName: 'Сильная аура',
  desc: 'Создает вокруг цели слабую ауру',
  cost: 8,
  baseExp: 6,
  costType: 'mp',
  lvl: 2,
  orderType: 'self',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+6', '1d3+7', '1d2+8'],
  profList: ['m'],
});
