/* eslint-disable @typescript-eslint/no-use-before-define, max-classes-per-file */
import { DmgMagic } from '@/arena/Constuructors/DmgMagicConstructor';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import type { Affect } from '../Constuructors/interfaces/Affect';
import type { BaseActionParams } from '@/arena/Constuructors/BaseAction';

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
  chance: ['1d80+20', '1d40+60', '1d20+80'],
  effect: ['1d1+10', '1d1+20', '1d1+30'],
  profList: ['m'],
} satisfies MagicArgs;

class LightShield extends DmgMagic {
  modifier = 0;

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

  override modifyEffect(effect: number, params?: BaseActionParams): number {
    const modifiedEffect = super.modifyEffect(effect, params);
    return modifiedEffect * this.modifier * 0.01;
  }
}

class LightShieldBuff extends LongMagic implements Affect {
  run() {
    const { target, initiator } = this.params;
    target.flags.isLightShielded.push({ initiator, val: 1 });
  }

  runLong(): void {
    const { target, initiator } = this.params;
    target.flags.isLightShielded.push({ initiator, val: 1 });
  }

  postAffect: Affect['postAffect'] = ({
    params: { initiator, target, game },
    status: { effect },
  }) => {
    const results: SuccessArgs[] = [];

    target.flags.isLightShielded.forEach(({ initiator: shielder }) => {
      lightShield.modifier = effect;
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
