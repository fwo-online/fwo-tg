import { OrderType } from '@fwo/shared';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { Aura, AuraEffect } from './aura';

const params: MagicArgs = Object.freeze({
  name: 'strongAura',
  displayName: 'Сильная аура',
  desc: 'Создает вокруг цели слабую ауру',
  cost: 8,
  baseExp: 6,
  costType: 'mp',
  lvl: 2,
  orderType: OrderType.Self,
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+6', '1d3+7', '1d2+8'],
  profList: ['m'],
});

class StrongAura extends Aura {
  effectInstanse = new AuraEffect(params);
}

export const strongAura = new StrongAura(params);
