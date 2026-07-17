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

export const createGhost = (lvl = 1, id: string | number = '', budgetScale = 1) => {
  const machete = new ItemModel(arena.items.machete);
  const { harks, abilities } = resolveMonsterConfig(
    MonsterType.Ghost,
    lvl,
    budgetScale,
  );

  const ghost = MonsterService.create(
    {
      nickname: `👻 Призрак ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Mage,
      harks,
      magics: abilities.magics,
      skills: abilities.skills,
      passiveSkills: abilities.passiveSkills,
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
