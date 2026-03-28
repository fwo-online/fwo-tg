import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';
import { MonsterAI } from '@/arena/MonsterService/MonsterAI';

export class GhostAI extends MonsterAI {
  makeOrder(game: GameService): void {
    if (!this.monster.alive) {
      return;
    }

    // Пробуем использовать безумие
    if (this.orderMadness(game)) {
      return;
    }

    const target = this.chooseTarget(game);
    if (!target) {
      return;
    }

    this.orderAttack(game, target, 100);
  }

  private orderMadness(game: GameService): boolean {
    // 30% шанс использовать безумие
    if (!MiscService.chance(30)) {
      return false;
    }

    const cost = 10; // Стоимость madness
    if (this.monster.stats.val('mp') < cost) {
      return false;
    }

    const targets = shuffle(game.players.aliveNonBotPlayers);
    if (!targets.length) {
      return false;
    }

    try {
      game.orders.orderAction({
        action: 'madness',
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

export const createGhost = (lvl = 1, id: string | number = '') => {
  const machete = new ItemModel(arena.items.machete);

  const ghost = MonsterService.create(
    {
      nickname: `👻 Призрак ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Mage,
      harks: {
        str: Math.round(lvl * 1 + 5),
        dex: Math.round(lvl * 2 + 10),
        int: Math.round(lvl * 3 + 12),
        wis: Math.round(lvl * 2 + 10),
        con: Math.round(lvl * 2 + 8),
      },
      magics: { madness: 1 },
      items: [machete],
      equipment: new Map([[ItemWear.MainHand, machete]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Ghost,
    GhostAI,
  );

  // Призрак устойчив к некоторым эффектам
  ghost.modifiers.chance.fail.paralysis = 50;
  ghost.modifiers.chance.fail.disarm = 100; // Нельзя обезоружить призрака
  ghost.modifiers.chance.fail.sleep = 100; // Призрак не спит

  return ghost;
};
