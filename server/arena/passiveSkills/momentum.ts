import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

const weaponTypes = ['range'];
const MAX_STACKS = 3;
const BONUS_PER_STACK = 0.05; // +5% урона за стак

/**
 * 🏹 Кураж
 * Успешные попадания из оружия дальнего боя накапливают боевой кураж:
 * восстанавливают энергию и увеличивают урон последующих атак (до 3 стаков)
 */
class Momentum extends PassiveSkillConstructor {
  weaponTypes = weaponTypes;

  constructor() {
    super({
      name: 'momentum',
      displayName: '🏹 Кураж',
      description:
        'Каждое попадание из оружия дальнего боя накапливает кураж: восстанавливает энергию и увеличивает урон атак',
      chance: [100, 100, 100],
      effect: [2, 3, 5],
      profList: { l: 1 },
      bonusCost: [10, 20, 30],
      branch: 'barrage',
      branches: ['barrage'],
      actionTypes: ['phys'],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageDeal(ctx, action) {
        momentum.onBeforeDamageDeal(ctx, action);
      },
      onDamageDealt(ctx, action) {
        momentum.onDamageDealt(ctx, action);
      },
    });
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    if (!this.canTrigger(ctx, action) || !action.effectType) {
      return;
    }

    const { initiator } = ctx.params;

    const stackAffect = initiator.affects
      .getEffectsByAction(this.name)
      .find(({ type }) => type === 'effect');

    const stacks = stackAffect?.value ?? 0;
    if (stacks <= 0) {
      return;
    }

    this.status.effect = 1 + stacks * BONUS_PER_STACK;

    ctx.status.mulEffectPart(action.effectType, this.status.effect);
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (!this.canTrigger(ctx, action) || !action.effectType) {
      return;
    }

    const { initiator } = ctx.params;

    this.status.effect = this.getEffect(this.context);

    // Восстанавливаем энергию
    initiator.stats.up('en', this.status.effect);

    // Добавляем / обновляем стак куража
    const currentStack = initiator.affects
      .getEffectsByAction(this.name)
      .find((a) => a.type === 'effect');
    if (currentStack) {
      currentStack.value = Math.min((currentStack.value ?? 0) + 1, MAX_STACKS);
    } else {
      initiator.affects.addEffect({
        action: this.name,
        initiator,
        value: 1,
      });
    }

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(this.displayName)}: ${bold(args.initiator.nick)} поймал кураж ${brackets(`⚡+${args.effect} энергии`)}`;
  }
}

export const momentum = new Momentum();
export default momentum;
