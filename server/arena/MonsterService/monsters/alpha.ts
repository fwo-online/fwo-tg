import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { WolfAI } from '@/arena/MonsterService/monsters/wolf';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { beastCall } from '@/arena/skills';
import { ItemModel } from '@/models/item';
import {
  resolveMonsterConfig,
} from '@/arena/MonsterService/balance/balance';

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
          proc: 75,
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

export const createAlpha = (lvl = 1, _id?: string | number, _budgetScale = 1) => {
  const claws = new ItemModel(arena.items.claws);
  const { harks, abilities } = resolveMonsterConfig(MonsterType.Alpha, lvl, _budgetScale);

  // Alpha's beastCall scales with level (1-3 based on lvl/15), terrifyingHowl always 3
  if (abilities.skills.beastCall) {
    abilities.skills.beastCall = Math.max(1, Math.min(Math.round(lvl / 15), 3));
  }
  abilities.skills.terrifyingHowl = 3;

  const alpha = MonsterService.create(
    {
      nickname: '🐺 Альфа',
      prof: CharacterClass.Warrior,
      harks,
      magics: { bleeding: 3 },
      skills: abilities.skills,
      passiveSkills: { lacerate: 3, nightcall: 1 },
      items: [claws],
      equipment: new Map([[ItemWear.TwoHands, claws]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Alpha,
    AlfaAI,
  );
  alpha.modifiers.chance.fail.paralysis = 90;
  alpha.modifiers.chance.fail.madness = 50;
  alpha.modifiers.chance.fail.disarm = 50;

  return alpha;
};
