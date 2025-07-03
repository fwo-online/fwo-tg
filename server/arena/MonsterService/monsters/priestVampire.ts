import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';

export class PriestVampireAI extends MonsterAI {
  orderCurse(game: GameService) {
    if (!this.monster.checkCost('curse')) {
      return false;
    }

    if (game.round.count > 1) {
      return false;
    }

    if (MiscService.chance(66)) {
      return false;
    }

    const target = shuffle(game.players.getAliveEnemies(this.monster)).at(0);

    if (!target) {
      return false;
    }

    try {
      game.orders.orderAction({
        initiator: this.monster.id,
        target: target.id,
        action: 'curse',
        proc: 100,
      });
      return true;
    } catch {
      return false;
    }
  }

  orderVampirism(game: GameService) {
    if (!this.monster.checkCost('vampirism')) {
      return false;
    }

    const target = shuffle(game.players.getAliveEnemies(this.monster)).at(0);

    if (!target) {
      return false;
    }

    try {
      game.orders.orderAction({
        initiator: this.monster.id,
        target: target.id,
        action: 'vampirism',
        proc: 100,
      });
      return true;
    } catch {
      return false;
    }
  }

  makeOrder(game: GameService): void {
    if (!this.monster.alive) {
      return;
    }

    if (this.orderCurse(game)) {
      return;
    }

    if (this.orderVampirism(game)) {
      return;
    }

    this.orderRegeneration(game);
  }
}

export const createPriestVampire = (lvl = 1, id: string | number = '') => {
  const vampireCorset = new ItemModel(arena.items.vampireCorset);
  const vampireBracelet = new ItemModel(arena.items.vampireBracelet);
  const vampireMask = new ItemModel(arena.items.vampireMask);
  const vampirePants = new ItemModel(arena.items.vampirePants);

  const priestVampire = MonsterService.create(
    {
      nickname: `🧛‍♀️ Вампир-жрица ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Priest,
      harks: {
        str: Math.round(lvl * 1 + 10),
        dex: Math.round(lvl * 1 + 10),
        int: Math.round(lvl * 2 + 10),
        wis: Math.round(lvl * 5 + 10),
        con: Math.round(lvl * 3 + 10),
      },
      magics: { vampirism: 3, curse: 3 },
      items: [vampireCorset, vampireBracelet, vampireMask, vampirePants],
      equipment: new Map([
        [ItemWear.Body, vampireCorset],
        [ItemWear.Arms, vampireBracelet],
        [ItemWear.Head, vampireMask],
        [ItemWear.Legs, vampirePants],
      ]),
      exp: expToLevel(lvl),
    },
    MonsterType.Vampire,
    PriestVampireAI,
  );

  priestVampire.resists.fire = 1.2;
  priestVampire.resists.physical = 0.8;

  return priestVampire;
};
