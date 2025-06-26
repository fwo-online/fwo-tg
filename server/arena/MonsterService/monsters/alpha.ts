import { ItemWear, MonsterType } from '@fwo/shared';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { beastCall } from '@/arena/skills';
import { ItemModel } from '@/models/item';

class AlfaAI extends MonsterAI {
  beastCallUsed = false;

  makeOrder(game: GameService) {
    if (!this.monster.alive) {
      return;
    }

    const beastCallUsed = game
      .getLastRoundResults()
      .some((result) => result.action === beastCall.displayName && isSuccessResult(result));
    if (beastCallUsed) {
      this.beastCallUsed = true;
    }

    const randomChance = MiscService.dice('1d100') > 90;
    const isHalfHP = this.monster.stats.val('hp') < this.monster.stats.val('base.hp') / 2;
    const isAlliesAlive = game.players.getAliveAllies(this.monster).length > 0;

    console.log(randomChance, isHalfHP, isAlliesAlive);
    if ((randomChance || isHalfHP || !isAlliesAlive) && !this.beastCallUsed) {
      game.orders.orderAction({
        action: 'beastCall',
        initiator: this.monster.id,
        target: this.monster.id,
        proc: 50,
      });
    }

    const target = this.chooseTarget(game);

    if (!target) {
      return;
    }

    game.orders.orderAction({
      action: 'attack',
      initiator: this.monster.id,
      target: target.id,
      proc: this.monster.proc,
    });
  }

  private chooseTarget(game: GameService) {
    const targets = game.players.alivePlayers.filter(({ isBot }) => !isBot);

    if (!targets.length) {
      return;
    }

    if (MiscService.dice('1d100') > 50) {
      if (targets.length) {
        return targets.reduce((target, player) => {
          if (target.stats.val('hp') < player.stats.val('hp')) {
            return target;
          }
          return player;
        });
      }
    } else {
      return targets.at(MiscService.randInt(0, targets.length));
    }
  }
}

export const createAlpha = (lvl = 1) => {
  const claws = new ItemModel(arena.items.claws);

  const alpha = MonsterService.create(
    {
      nickname: '🐺 Альфа',
      harks: {
        str: Math.round(lvl * 8 + 15),
        dex: Math.round(lvl * 1 + 15),
        int: Math.round(lvl * 1 + 10),
        wis: Math.round(lvl * 0.5 + 10),
        con: Math.round(lvl * 15 + 25),
      },
      magics: { bleeding: 3 },
      skills: { beastCall: Math.max(1, Math.min(Math.round(lvl / 15), 3)) },
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

  return alpha;
};
