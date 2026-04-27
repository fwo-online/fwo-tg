import type { BaseActionParams } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';

class NineLives extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'nineLives',
      displayName: '🐱 Девять жизней',
      description: 'Шанс остаться в живых при получении смертельного урона один раз за бой',
      chance: [10, 20, 33],
      effect: [],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onCast(params) {
        nineLives.onCast(params);
      },
    });
  }

  onCast(params: BaseActionParams) {
    const { initiator, target, game } = params;
    this.createContext(initiator, target, game);

    if (!this.isActive()) {
      return;
    }

    if (initiator.stats.val('hp') > 0) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    const hp = initiator.stats.val('hp');

    initiator.stats.set('hp', 0.05);
    this.status.effect = Math.abs(hp);
    initiator.resetKiller();
    initiator.affects.removeEffectsByAction(this.name);

    this.next();
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} ❤️+${args.effect}/${args.hp}`;
  }
}

export const nineLives = new NineLives();
