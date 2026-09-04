import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { bold, brackets, italic } from '@/utils/formatString';

class Grace extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'grace',
      displayName: '✨ Благодать',
      description: 'Атаки оружием исцеляют персонажа или союзника святым светом, а исцеляющие заклинания могут удвоить эффект',
      chance: [15, 25, 35],
      effect: [0.1, 0.15, 0.2],
      bonusCost: [10, 20, 30],
      branch: 'holy',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        grace.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (!this.isActive()) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    const allies = game.players.getAliveAllies(initiator);
    allies.push(initiator);

    const targetAlly = game.players.getRandom(allies);
    this.createContext(initiator, targetAlly, game);

    const healAmount = Math.max(1, Math.round(ctx.status.effect * this.getEffect()));
    this.status.effect = healAmount;

    effectService.heal(this.context);

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} озарил святым светом ${bold(args.target.nick)} ${brackets(`💖+${args.effect}/${args.hp}`)}`;
  }
}

export const grace = new Grace();
