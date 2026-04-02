import { type ActionType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Глюки
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'glitch',
  displayName: 'Глюки',
  desc: 'Глюки, вводит цель в замешательство, цель атакуют любого из игроков',
  cost: 12,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: OrderType.All,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80+20', '1d40+60', '1d20+80'],
  profList: ['m'],
  effect: [],
});

const actionTypes: ActionType[] = ['phys', 'dmg-magic', 'dmg-magic-long', 'aoe-dmg-magic'];

class Glitch extends CommonMagic {
  run() {
    const { initiator, target } = this.params;
    target.affects.addEffect({
      action: this.name,
      duration: 1,
      initiator,
      proc: initiator.proc,
      onBeforeRun(ctx, action, affect) {
        return glitchEffect.onBeforeRun(ctx, action, affect);
      },
    });
  }
}

class GlitchEffect extends CommonMagic {
  isAffect = true;

  run(): void {}

  onBeforeRun(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (!actionTypes.includes(action.actionType)) {
      return;
    }

    const { initiator, target, game } = ctx.params;

    ctx.params.target = game.players.getRandomAlive();
    console.debug(
      `glitch debug:: new target: ${ctx.params.target.nick}, old target:: ${target.nick}`,
    );

    ctx.status.affects.push(
      this.getSuccessResult({
        initiator: affect.initiator,
        target: initiator,
        game,
      }),
    );
  }
}

export const glitchEffect = new GlitchEffect(params);
export const glitch = new Glitch(params);
