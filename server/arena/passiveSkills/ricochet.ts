import { attack } from '@/arena/actions';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import type GameService from '@/arena/GameService';
import { formatExp } from '@/arena/LogService/utils/format-exp';
import MiscService from '@/arena/MiscService';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';
import { italic } from '@/utils/formatString';

class Ricochet extends PassiveSkillConstructor {
  weaponTypes = ['range'];
  private lock = false;

  constructor() {
    super({
      name: 'ricochet',
      displayName: '🏹 Рикошет',
      description:
        'Выстрел из оружия дальнего боя имеет шанс отскочить в дополнительную цель. С каждым последующим отскоком шанс и урон снижаются',
      profList: { l: 1 },
      chance: [15, 20, 25, 30, 40, 50],
      effect: [20, 30, 40, 50, 60, 70],
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        ricochet.onDamageDealt(ctx, action);
      },
    });
  }

  private getNextTarget(game: GameService, initiator: Player, visitedTargetIds: Set<string>) {
    const aliveEnemies = game.players
      .getAliveEnemies(initiator)
      .filter((enemy) => !visitedTargetIds.has(enemy.id));

    if (aliveEnemies.length) {
      return game.players.getRandom(aliveEnemies);
    }
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (this.lock) {
      return;
    }

    const { initiator, target, game } = ctx;
    this.createContext(initiator, target, game);

    if (action.actionType !== 'phys') {
      return;
    }

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive(ctx)) {
      return;
    }

    const visitedTargetIds = new Set<string>([target.id]);
    let currentDamage = ctx.status.effect;
    let currentChance = this.getChance();
    const effectMultiplier = this.getEffect() / 100;

    try {
      this.lock = true;

      while (MiscService.rndm('1d100') <= currentChance) {
        const nextTarget = this.getNextTarget(game, initiator, visitedTargetIds);
        if (!nextTarget) {
          break;
        }

        visitedTargetIds.add(nextTarget.id);

        const bounceDamage = floatNumber(currentDamage * effectMultiplier);
        if (bounceDamage <= 0) {
          break;
        }

        const bounceCtx = ctx.cloneWith(nextTarget);
        bounceCtx.status.effect = bounceDamage;

        const val = effectService.rawDamage(bounceCtx, action);
        bounceCtx.status.exp = attack.getEffectExp(bounceCtx, val);

        ctx.status.expArr.push({
          initiator: ctx.initiator,
          target: bounceCtx.target,
          exp: attack.getEffectExp(bounceCtx, val),
          hp: bounceCtx.target.stats.val('hp'),
          val,
          reason: this.displayName,
        });

        currentDamage = bounceDamage;
        currentChance = Math.round(currentChance * 0.5);
      }
    } finally {
      this.lock = false;
    }
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${formatExp({
      ...args,
      actionType: 'phys',
    })}`;
  }
}

export const ricochet = new Ricochet();
