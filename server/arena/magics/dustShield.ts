import { OrderType } from '@fwo/shared';
import { clamp } from 'es-toolkit';
import { Magic, type MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { LongMagic } from '../Constuructors/LongMagicConstructor';
import { findByTarget, isPhysicalDamageResult } from '../Constuructors/utils';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';

const minProtect = 5;
const maxProtect = 20;

const params: MagicArgs = {
  name: 'dustShield',
  displayName: 'Щит праха',
  desc: `Щит из праха повышает защиту кастера на величину, результат деления количества повреждений предыдущего раунда на количество атакеров, но не больше ${maxProtect} и не меньше ${minProtect}.`,
  cost: 14,
  baseExp: 2,
  costType: 'mp',
  lvl: 4,
  orderType: OrderType.Self,
  aoeType: 'target',
  magType: 'good',
  chance: [90, 96, 98],
  profList: ['m'],
  effect: ['1d3', '1d5', '1d7'],
};

class DustShield extends Magic {
  run(initiator: Player, target: Player, _game: GameService): void {
    target.affects.addEffect({
      action: this.name,
      duration: initiator.stats.val('spellLength'),
      proc: initiator.proc,
      initiator,
      value: 0,
      onCast({ initiator, target, game }) {
        initiator.proc = this.proc;
        dustShieldEffect.duration = this.duration;
        dustShieldEffect.cast(initiator, target, game);
      },
    });
  }

  getEffectExp(effect: number, baseExp = 0): number {
    return Math.round(baseExp * effect);
  }
}

class DustShieldEffect extends LongMagic {
  run(initiator: Player, target: Player, game: GameService): void {
    const protect = this.calculateProtect(initiator, target, game);

    target.stats.up('phys.defence', clamp(protect, minProtect, maxProtect));
  }

  getEffectExp(effect: number, baseExp = 0): number {
    return Math.round(baseExp * effect);
  }

  calculateProtect(initiator: Player, target: Player, game: GameService): number {
    const effect = this.effectVal({ initiator, target, game });

    const results = game.getLastRoundResults();
    const physicalDamageResults = results
      .filter(isPhysicalDamageResult)
      .filter(findByTarget(target.nick));

    const damageTaken = physicalDamageResults.reduce((sum, { effect }) => sum + effect, 0);
    if (damageTaken) {
      return effect + damageTaken / physicalDamageResults.length || 0;
    }

    return effect;
  }
}

export const dustShieldEffect = new DustShieldEffect(params);
export const dustShield = new DustShield(params);
