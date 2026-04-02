import { EffectType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import type { DmgMagicArgs } from '@/arena/Constuructors/DmgMagicConstructor';
import { LongDmgMagic } from '@/arena/Constuructors/LongDmgMagicConstructor';
import type { Affect } from '../Constuructors/interfaces/Affect';

/**
 * Световой щит
 * Основное описание магии общее требование есть в конструкторе
 */
const params: DmgMagicArgs = Object.freeze({
  name: 'lightShield',
  displayName: 'Световой щит',
  desc: 'Возвращает часть физического урона в виде чистого, атакующему цель под действием щита',
  cost: 3,
  baseExp: 8,
  costType: 'mp',
  lvl: 4,
  orderType: OrderType.Team,
  aoeType: 'target',
  magType: 'good',
  chance: ['1d80+20', '1d40+60', '1d20+80'],
  effect: ['1d1+10', '1d1+20', '1d1+30'],
  profList: ['m'],
  dmgType: EffectType.Clear,
});

class LightShield extends CommonMagic {
  run() {
    const { initiator, target } = this.params;

    target.affects.addEffect({
      action: this.name,
      duration: initiator.stats.val('spellLength'),
      initiator,
      proc: initiator.proc,
      onDamageReceived(ctx, action, affect) {
        return lightShieldEffect.onDamageReceived(ctx, action, affect);
      },
    });
  }
}

class LightShieldEffect extends LongDmgMagic {
  isAffect = true;

  onDamageReceived(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.effectType !== EffectType.Physical) {
      return;
    }

    const { effect } = ctx.status;

    affect.initiator.setProc(effect * (affect.proc ?? 1) * 0.01);

    this.createContext(affect.initiator, ctx.params.initiator, ctx.params.game);
    this.run();
    this.calculateExp();
    this.checkTargetIsDead();
    this.next();

    ctx.status.affects.push(
      this.getSuccessResult({
        initiator: affect.initiator,
        target: ctx.params.initiator,
        game: ctx.params.game,
      }),
    );
  }

  run() {
    const { target } = this.params;
    target.stats.down('hp', this.effectVal());
  }
}

export const lightShield = new LightShield({
  ...params,
  baseExp: 6,
});

export const lightShieldEffect = new LightShieldEffect(params);
