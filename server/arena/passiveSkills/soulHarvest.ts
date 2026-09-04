import arena from '@/arena';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

class SoulHarvest extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'soulHarvest',
      displayName: '💀 Жатва душ',
      description:
        'При гибели врага поглощает его душу и восстанавливает заряд/ману случайного заклинания школы Тьмы',
      chance: [50, 75, 100],
      effect: [1, 1, 1],
      bonusCost: [10, 20, 30],
      branch: 'darkness',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        soulHarvest.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, _action: BaseAction) {
    const { initiator, target, game } = ctx.params;

    // Срабатывает при гибели цели
    if (target.stats.val('hp') > 0) {
      return;
    }

    this.createContext(initiator, target, game);

    if (!this.isActive(ctx)) {
      return;
    }

    if (!this.checkChance(ctx)) {
      return;
    }

    // Ищем заклинания ветки тьмы
    // const darknessSpells = Object.values(arena.magics).filter((magic) =>
    //   magic.isInBranch('darkness'),
    // );
    // const restoredSpell = game.players.getRandom(darknessSpells);
    // const spellName = restoredSpell ? restoredSpell.displayName : 'Тьма';

    // Восстанавливаем ресурсы кастеру
    initiator.stats.up('mp', 15);
    this.status.effect = 1;

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} поглотил душу ${bold(args.target.nick)} ${brackets('💀 Восстановлено заклинание Тьмы!')}`;
  }
}

export const soulHarvest = new SoulHarvest();
