import { EffectType, OrderType } from '@fwo/shared';
import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import type { DmgMagicArgs } from '@/arena/Constuructors/DmgMagicConstructor';
import { effectService } from '@/arena/EffectService';
import { bold, italic } from '../../utils/formatString';
import { LongDmgMagic } from '../Constuructors/LongDmgMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Ледяное прикосновение
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: DmgMagicArgs = Object.freeze({
  name: 'frostTouch',
  displayName: 'Ледяное прикосновение',
  desc: 'Поражает цель ледяным касанием, отнимая жизни. (длительная)',
  cost: 3,
  baseExp: 16,
  costType: 'mp',
  lvl: 1,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d2', '1d2+1', '1d2+2'],
  dmgType: EffectType.Frost,
  profList: ['m'],
});

class FrostTouch extends CommonMagic {
  private case = 'Ледяным прикосновением';

  run() {
    const { initiator, target } = this.params;
    target.affects.addLongEffect({
      action: this.name,
      initiator,
      proc: initiator.proc,
      duration: initiator.stats.val('spellLength'),
      onCast({ initiator, target, game }) {
        initiator.proc = this.proc;
        frostTouchEffect.duration = this.duration;
        frostTouchEffect.cast(initiator, target, game);
      },
    });
  }

  customMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} поражает ${bold(target.nick)} ${italic(this.case)}`;
  }
}

class FrostTouchEffect extends LongDmgMagic {
  run() {
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);
  }

  customMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    return `${italic(this.displayName)} (${bold(initiator.nick)}) отнимает жизни у игрока ${bold(target.nick)}`;
  }
}

export const frostTouch = new FrostTouch(params);
export const frostTouchEffect = new FrostTouchEffect(params);
