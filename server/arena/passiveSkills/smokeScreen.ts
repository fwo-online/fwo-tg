import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🏃 Дымовая завеса
 * При получении удара следопыт с шансом бросает дымовую шашку, резко снижая точность последующих атак по себе
 */
class SmokeScreen extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'smokeScreen',
      displayName: '🏃 Дымовая завеса',
      description: 'При получении урона следопыт с шансом бросает дымовую шашку, смягчая последующие удары',
      chance: [25, 35, 50],
      effect: [20, 30, 40],
      bonusCost: [10, 20, 30],
      branch: 'scout',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageReceived(ctx, action) {
        smokeScreen.onDamageReceived(ctx, action);
      },
    });
  }

  onDamageReceived(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { target: defender, game } = ctx;
    this.createContext(defender, defender, game);

    if (!this.isActive(this.context)) {
      return;
    }

    if (!this.checkChance(this.context)) {
      return;
    }

    const bonus = this.getEffect(this.context);
    defender.affects.addLongEffect({
      action: this.name,
      duration: 1,
      proc: defender.proc,
      initiator: defender,
      value: bonus,
      onBeforeDamageRecieve(receiveCtx, act, affect) {
        if (act.actionType === 'phys') {
          const red = affect.value ?? 25;
          receiveCtx.status.effect = Math.max(1, Math.round(receiveCtx.status.effect * (1 - red / 100)));
        }
      },
    });

    this.status.effect = bonus;
    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} бросил дымовую шашку ${brackets(`🏃-${args.effect}% урона врагов`)}`;
  }
}

export const smokeScreen = new SmokeScreen();
