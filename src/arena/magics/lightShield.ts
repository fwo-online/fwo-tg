import type { PostAffect } from '../Constuructors/interfaces/PostAffect';
import { LongDmgMagic } from '../Constuructors/LongDmgMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';
/**
 * Магический доспех
 * Основное описание магии общее требование есть в конструкторе
 */
class LightShield extends LongDmgMagic implements PostAffect {
  constructor() {
    super({
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
      chance: [100, 100, 100],
      effect: ['1d1', '3d3', '5d5'],
      profList: ['m'],
      dmgType: 'clear',
    });
  }

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
  ): void | SuccessArgs | SuccessArgs[] {
    return target.flags.isLightShielded.map(() => {
      const effect = this.effectVal({ initiator: target, target: initiator, game });

      initiator.stats.down('hp', effect);

      return super.getSuccessResult({ initiator: target, target: initiator, game });
    });
  }

  getSuccessResult({ initiator, target, game } = this.params): SuccessArgs {
    return {
      ...super.getSuccessResult({ initiator, target, game }),
      actionType: 'magic',
    };
  }
}

export default new LightShield();
