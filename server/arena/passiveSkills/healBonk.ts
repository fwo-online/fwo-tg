import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { bold, brackets, italic } from '@/utils/formatString';

class HealBonk extends PassiveSkillConstructor {
  weaponTypes = ['heal'];

  constructor() {
    super({
      name: 'healBonk',
      displayName: '🔔 Целебный боньк',
      description:
        'Атака издаёт целебный "боньк". Звукотерапия лечит случайного союзника. Не спрашивайте, это магия',
      chance: [50, 75, 100],
      effect: [0.5, 1, 2],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: healBonk.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        healBonk.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (action.actionType !== 'phys') {
      return;
    }

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive()) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    const allies = game.players.getAliveAllies(initiator);
    allies.push(initiator);

    const randomAlly = game.players.getRandom(allies);
    this.createContext(initiator, randomAlly, game);
    this.status.effect = ctx.status.effect * this.getEffect();

    effectService.heal(this.context);

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} бонькнул ${
      // biome-ignore lint/style/noNonNullAssertion: caught
      bold(args.initiator.weapon.item!.info!.case!)
    } ${brackets(`${args.target.nick}: 💖${args.effect}/${args.hp}`)}`;
  }
}

export const healBonk = new HealBonk();
