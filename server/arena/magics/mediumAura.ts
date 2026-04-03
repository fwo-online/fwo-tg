import { OrderType } from '@fwo/shared';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { Aura, AuraEffect } from './aura';

const params: MagicArgs = Object.freeze({
  name: 'mediumAura',
  displayName: 'Средняя аура',
  desc: 'Создает вокруг цели среднюю ауру',
  cost: 6,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: OrderType.Self,
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+4', '1d3+5', '1d2+6'],
  profList: ['m'],
});

class MediumAura extends Aura {
  effectInstanse = new AuraEffect(params);
}

export const mediumAura = new MediumAura(params);
