import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';

export class SkeletonAI extends MonsterAI {
  makeOrder(game: GameService): void {
    const target = game.players.aliveNonBotPlayers[0];

    if (!target) {
      return;
    }

    this.orderAttack(game, target, 50);
  }
}

export const createSkeleton = (lvl = 1, id: string | number = '') => {
  const machete = new ItemModel(arena.items.machete);

  const Skeleton = MonsterService.create(
    {
      nickname: `💀 Скелет ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Warrior,
      harks: {
        str: Math.round(lvl * 3),
        dex: Math.round(lvl * 1),
        int: Math.round(lvl * 3),
        wis: Math.round(lvl * 2),
        con: Math.round(lvl * 1),
      },
      items: [machete],
      equipment: new Map([[ItemWear.MainHand, machete]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Skeleton,
    SkeletonAI,
  );

  return Skeleton;
};
