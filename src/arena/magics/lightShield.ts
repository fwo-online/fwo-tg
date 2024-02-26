/* eslint-disable @typescript-eslint/no-use-before-define, max-classes-per-file */
import { DmgMagic } from '@/arena/Constuructors/DmgMagicConstructor';
import type { PostAffect } from '@/arena/Constuructors/interfaces/PostAffect';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

/**
 * Магический доспех
 * Основное описание магии общее требование есть в конструкторе
 */

const params = {
  name: 'lightShield',
  displayName: 'Световой щит',
  desc: 'Возвращает часть физического урона в виде чистого, атакующему цель под действием щита',
  cost: 3,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: 'team',
  aoeType: 'target',
  magType: 'good',
  chance: ['1d80', '1d90', '1d100'],
  effect: ['1d1+10', '1d1+20', '1d1+30'],
  profList: ['m'],
} satisfies MagicArgs;

class LightShield extends DmgMagic {
  cast(initiator: Player, target: Player, game: GameService): void {
    this.params = { initiator, target, game };
    this.run();
    this.getExp();
    this.checkTargetIsDead();
  }

  run() {
    const { target } = this.params;
    target.stats.down('hp', this.effectVal());
  }
}

class LightShieldBuff extends LongMagic implements PostAffect {
  run() {
    const { target, initiator } = this.params;
    target.flags.isLightShielded.push({ initiator: initiator.nick, val: initiator.proc });
  }

  runLong(): void {
    const { target, initiator } = this.params;
    target.flags.isLightShielded.push({ initiator: initiator.nick, val: initiator.proc });
  }

  postAffect(
    { initiator, target, game } = this.params,
    { effect } = { effect: 0 },
  ): void | SuccessArgs | SuccessArgs[] {
    return target.flags.isLightShielded.map(({ val }) => {
      target.setProc(effect * val * 0.01);
      lightShield.cast(target, initiator, game);
      return lightShield.getSuccessResult({ initiator: target, target: initiator, game });
    });
  }
}

const lightShield = new LightShield({ ...params, dmgType: 'clear' });
const lightShieldBuff = new LightShieldBuff(params);

export default lightShieldBuff;
