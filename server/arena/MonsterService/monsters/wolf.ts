import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import { differenceBy, isString, shuffle } from 'es-toolkit';
import arena from '@/arena';
import { attack } from '@/arena/actions';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { magicWall } from '@/arena/magics';
import { terrifyingHowl } from '@/arena/skills';
import { ItemModel } from '@/models/item';

export class WolfAI extends MonsterAI {
  makeOrder(game: GameService) {
    if (!this.monster.alive) {
      return;
    }

    const result = this.orderHowl(game);
    if (result) {
      return;
    }

    this.orderAttack(game);
  }

  private canHowl(game: GameService): boolean {
    if (this.monster.proc < 50) {
      return false;
    }

    const cost = terrifyingHowl.cost[this.monster.skills.terrifyingHowl + 1];
    if (this.monster.stats.val(terrifyingHowl.costType) < cost) {
      return false;
    }

    if (MiscService.chance(20)) {
      return false;
    }

    const howlOrders = game.orders.ordersList.filter(({ action }) => action === 'terrifyingHowl');

    if (howlOrders.length >= 2) {
      return false;
    }

    return true;
  }

  private orderHowl(game: GameService): boolean {
    if (!this.canHowl(game)) {
      return false;
    }

    const blockedAttack = game
      .getLastRoundResults()
      .find(
        (result) =>
          result.initiator.isBot &&
          result.action === attack.displayName &&
          !isSuccessResult(result) &&
          !isString(result.reason),
      );

    console.debug('WOLF_ORDER', blockedAttack);
    if (!blockedAttack || isSuccessResult(blockedAttack) || isString(blockedAttack.reason)) {
      return false;
    }

    const enemies = shuffle(game.players.getAliveEnemies(this.monster));
    enemies.sort(({ prof }) =>
      [CharacterClass.Mage, CharacterClass.Priest].includes(prof) ? -1 : 1,
    );

    try {
      game.orders.orderAction({
        action: 'terrifyingHowl',
        initiator: this.monster.id,
        target: enemies[0].id,
        proc: 50,
      });
      return true;
    } catch {
      return false;
    }
  }

  private orderAttack(game: GameService): boolean {
    const target = this.chooseAttackTarget(game);

    if (!target) {
      return false;
    }

    try {
      game.orders.orderAction({
        action: 'attack',
        initiator: this.monster.id,
        target: target.id,
        proc: this.monster.proc,
      });

      return true;
    } catch {
      return false;
    }
  }

  private chooseAttackTarget(game: GameService) {
    const targets = shuffle(game.players.aliveNonBotPlayers);

    if (!targets.length) {
      return;
    }

    const playersBehindWall = game
      .getLastRoundResults()
      .filter(({ action }) => action === magicWall.displayName)
      .map(({ target }) => target);
    const avaiableTargets = differenceBy(targets, playersBehindWall, ({ id }) => id);

    if (avaiableTargets.length) {
      return avaiableTargets[0];
    }

    if (MiscService.chance(33)) {
      return targets.reduce((target, player) => {
        if (target.stats.val('hp') < player.stats.val('hp')) {
          return target;
        }
        return player;
      });
    } else {
      return targets[0];
    }
  }
}

export const createWolf = (lvl = 1, id: string | number = '') => {
  const fang = new ItemModel(arena.items.fang);
  const wolf = MonsterService.create(
    {
      nickname: `🐺 Волк ${id.toString()}`.trimEnd(),
      harks: {
        str: Math.round(lvl * 3 + 10),
        dex: Math.round(lvl * 1 + 10),
        int: Math.round(lvl * 1 + 10),
        wis: Math.round(lvl * 1 + 10),
        con: Math.round(lvl * 5 + 10),
      },
      magics: { bleeding: 1 },
      skills: { terrifyingHowl: 1 },
      passiveSkills: { lacerate: 1, nightcall: 1 },
      items: [fang],
      equipment: new Map([[ItemWear.TwoHands, fang]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Wolf,
    WolfAI,
  );
  wolf.modifiers.chance.fail.paralysis = 90;
  wolf.modifiers.chance.fail.madness = 30;
  wolf.modifiers.chance.fail.disarm = 30;

  return wolf;
};
