/* eslint-disable @typescript-eslint/no-use-before-define, max-classes-per-file */
import { DmgMagic } from '@/arena/Constuructors/DmgMagicConstructor';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import type { Affect } from '../Constuructors/interfaces/Affect';

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
  lvl: 4,
  orderType: 'team',
  aoeType: 'target',
  magType: 'good',
  chance: ['1d80', '1d90', '1d100'],
  effect: ['1d1+10', '1d1+20', '1d1+30'],
  profList: ['m'],
} satisfies MagicArgs;

class LightShield extends DmgMagic {
  cast(initiator: Player, target: Player, game: GameService): void {
    this.createContext(initiator, target, game);
    this.run();
    this.calculateExp();
    this.checkTargetIsDead();
  }

  run() {
    const { target } = this.params;
    target.stats.down('hp', this.effectVal());
  }
}

class LightShieldBuff extends LongMagic implements Affect {
  run() {
    const { target, initiator } = this.params;
    target.flags.isLightShielded.push({ initiator, val: initiator.proc });
  }

  runLong(): void {
    const { target, initiator } = this.params;
    target.flags.isLightShielded.push({ initiator, val: initiator.proc });
  }

  postAffect: Affect['postAffect'] = ({
    params: { initiator, target, game },
    status: { effect },
  }) => {
    const results: SuccessArgs[] = [];

    target.flags.isLightShielded.forEach(({ initiator: shielder, val }) => {
      shielder.setProc(effect * val * 0.01);
      lightShield.cast(shielder, initiator, game);
      results.push(lightShield.getSuccessResult({ initiator: shielder, target: initiator, game }));
    });

    return results;
  };
}

const lightShield = new LightShield({
  ...params,
  baseExp: 8,
  dmgType: 'clear',
});

const lightShieldBuff = new LightShieldBuff(params);

export default lightShieldBuff;
