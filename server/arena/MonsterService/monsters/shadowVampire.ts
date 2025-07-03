import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';

export class ShadowVampireAI extends MonsterAI {
  orderAttack(game: GameService) {
    const target = shuffle(game.players.getAliveEnemies(this.monster)).at(0);

    if (!target) {
      return false;
    }

    try {
      game.orders.orderAction({
        initiator: this.monster.id,
        target: target.id,
        action: 'attack',
        proc: this.monster.proc,
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

    this.orderAttack(game);
  }
}

export const createShadowVampire = (lvl = 1, id: string | number = '') => {
  const fang = new ItemModel(arena.items.fang);
  const vampireCorset = new ItemModel(arena.items.vampireCorset);
  const vampireBracelet = new ItemModel(arena.items.vampireBracelet);
  const vampireMask = new ItemModel(arena.items.vampireMask);
  const vampirePants = new ItemModel(arena.items.vampirePants);

  const shadowVampire = MonsterService.create(
    {
      nickname: `😈️️️️ Теневой вампир ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Warrior,
      harks: {
        str: Math.round(lvl * 3 + 10),
        dex: Math.round(lvl * 2 + 10),
        int: Math.round(lvl * 2 + 10),
        wis: Math.round(lvl * 2 + 10),
        con: Math.round(lvl * 3 + 10),
      },
      magics: {},
      passiveSkills: { markOfDarkness: 3, lacerate: 3 },
      items: [fang, vampireCorset, vampireBracelet, vampireMask, vampirePants],
      equipment: new Map([
        [ItemWear.TwoHands, fang],
        [ItemWear.Body, vampireCorset],
        [ItemWear.Arms, vampireBracelet],
        [ItemWear.Head, vampireMask],
        [ItemWear.Legs, vampirePants],
      ]),
      exp: expToLevel(lvl),
    },
    MonsterType.Vampire,
    ShadowVampireAI,
  );

  shadowVampire.modifiers.chance.fail.paralysis = 30;
  shadowVampire.modifiers.chance.fail.madness = 30;
  shadowVampire.modifiers.chance.fail.disarm = 30;

  shadowVampire.resists.fire = 1.2;
  shadowVampire.resists.physical = 0.8;

  return shadowVampire;
};
