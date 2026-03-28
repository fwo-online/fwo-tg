import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';
import { MonsterAI } from '@/arena/MonsterService/MonsterAI';

export class ElementalAI extends MonsterAI {
  makeOrder(game: GameService): void {
    if (!this.monster.alive) {
      return;
    }

    // Пробуем использовать цепь молний
    if (this.orderChainLightning(game)) {
      return;
    }

    const target = this.chooseTarget(game);
    if (!target) {
      return;
    }

    this.orderAttack(game, target, 100);
  }

  private orderChainLightning(game: GameService): boolean {
    // 40% шанс использовать цепь молний
    if (!MiscService.chance(40)) {
      return false;
    }

    const cost = 8; // Стоимость chainLightning
    if (this.monster.stats.val('mp') < cost) {
      return false;
    }

    const targets = shuffle(game.players.aliveNonBotPlayers);
    if (!targets.length) {
      return false;
    }

    try {
      game.orders.orderAction({
        action: 'chainLightning',
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

export const createElemental = (lvl = 1, id: string | number = '') => {
  const claws = new ItemModel(arena.items.claws);

  const elemental = MonsterService.create(
    {
      nickname: `⚡ Элементаль ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Mage,
      harks: {
        str: Math.round(lvl * 2 + 8),
        dex: Math.round(lvl * 1 + 5),
        int: Math.round(lvl * 4 + 15),
        wis: Math.round(lvl * 3 + 12),
        con: Math.round(lvl * 3 + 10),
      },
      magics: { chainLightning: 1 },
      items: [claws],
      equipment: new Map([[ItemWear.TwoHands, claws]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Elemental,
    ElementalAI,
  );

  // Элементаль устойчив к магическим эффектам
  elemental.modifiers.chance.fail.paralysis = 80;
  elemental.modifiers.chance.fail.madness = 50;
  elemental.modifiers.chance.fail.silence = 70; // Устойчив к молчанию

  return elemental;
};
