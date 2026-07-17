import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { resolveMonsterConfig } from '@/arena/MonsterService/balance/balance';
import { MonsterAI } from '@/arena/MonsterService/MonsterAI';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';

export class SpiderAI extends MonsterAI {
  makeOrder(game: GameService): void {
    if (!this.monster.alive) {
      return;
    }

    // Пробуем использовать паралич (ядовитый укус)
    if (this.orderParalysis(game)) {
      return;
    }

    const target = this.chooseTarget(game);
    if (!target) {
      return;
    }

    this.orderAttack(game, target, 100);
  }

  private orderParalysis(game: GameService): boolean {
    // 40% шанс использовать паралич
    if (!MiscService.chance(40)) {
      return false;
    }

    const cost = 5; // Стоимость paralysis
    if (this.monster.stats.val('mp') < cost) {
      return false;
    }

    const targets = shuffle(game.players.aliveNonBotPlayers);
    if (!targets.length) {
      return false;
    }

    try {
      game.orders.orderAction({
        action: 'paralysis',
        initiator: this.monster.id,
        target: targets[0].id,
        proc: 100,
      });
      return true;
    } catch {
      return false;
    }
  }

  private chooseTarget(game: GameService) {
    const targets = shuffle(game.players.aliveNonBotPlayers);
    return targets[0];
  }
}

export const createSpider = (lvl = 1, id: string | number = '', budgetScale = 1) => {
  const claws = new ItemModel(arena.items.claws);
  const { harks, abilities } = resolveMonsterConfig(
    MonsterType.Spider,
    lvl,
    budgetScale,
  );

  const spider = MonsterService.create(
    {
      nickname: `🕷️ Паук ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Warrior,
      harks,
      magics: abilities.magics,
      skills: abilities.skills,
      passiveSkills: abilities.passiveSkills,
      items: [claws],
      equipment: new Map([[ItemWear.TwoHands, claws]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Spider,
    SpiderAI,
  );

  // Паук устойчив к некоторым эффектам
  spider.modifiers.chance.fail.paralysis = 80; // Устойчив к своему же яду
  spider.modifiers.chance.fail.sleep = 50;

  return spider;
};
