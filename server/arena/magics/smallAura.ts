import { OrderType } from '@fwo/shared';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { Aura, AuraEffect } from './aura';

const params: MagicArgs = Object.freeze({
  name: 'smallAura',
  displayName: 'Малая аура',
  desc: 'Создает вокруг цели слабую ауру',
  cost: 3,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: OrderType.Self,
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['m'],
});

class SmallAura extends Aura {
  effectInstanse = new AuraEffect(params);
}

export const smallAura = new SmallAura(params);
