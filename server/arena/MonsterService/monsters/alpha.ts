import { ItemWear, MonsterType } from '@fwo/shared';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { WolfAI } from '@/arena/MonsterService/monsters/wolf';
import { beastCall } from '@/arena/skills';
import { ItemModel } from '@/models/item';

class AlfaAI extends WolfAI {
  beastCallUsed = false;

  orderBeastCall(game: GameService) {
    const beastCallUsed = game
      .getLastRoundResults()
      .some((result) => result.action === beastCall.displayName && isSuccessResult(result));
    if (beastCallUsed) {
      this.beastCallUsed = true;
    }

    const randomChance = MiscService.dice('1d100') > 90;
    const isHalfHP = this.monster.stats.val('hp') < this.monster.stats.val('base.hp') / 2;
    const isAlliesAlive = game.players.getAliveAllies(this.monster).length > 0;

    if ((randomChance || isHalfHP || !isAlliesAlive) && !this.beastCallUsed) {
      try {
        game.orders.orderAction({
          action: 'beastCall',
          initiator: this.monster.id,
          target: this.monster.id,
          proc: 50,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  makeOrder(game: GameService) {
    if (!this.monster.alive) {
      return;
    }

    this.orderBeastCall(game);
    super.makeOrder(game);
  }
}

export const createAlpha = (lvl = 1) => {
  const claws = new ItemModel(arena.items.claws);

  const alpha = MonsterService.create(
    {
      nickname: '🐺 Альфа',
      harks: {
        str: Math.round(lvl * 3 + 10),
        dex: Math.round(lvl * 1 + 10),
        int: Math.round(lvl * 1 + 10),
        wis: Math.round(lvl * 1 + 10),
        con: Math.round(lvl * 13 + 10),
      },
      magics: { bleeding: 3 },
      skills: { beastCall: Math.max(1, Math.min(Math.round(lvl / 15), 3)), terrifyingHowl: 3 },
      passiveSkills: { lacerate: 3, nightcall: 1 },
      items: [claws],
      equipment: new Map([[ItemWear.TwoHands, claws]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Wolf,
    AlfaAI,
  );
  alpha.modifiers.chance.fail.paralysis = 90;
  alpha.modifiers.chance.fail.madness = 50;
  alpha.modifiers.chance.fail.disarm = 50;

  return alpha;
};
