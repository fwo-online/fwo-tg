import arena from '@/arena';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';
import { ItemWear, MonsterType } from '@fwo/shared';

class AlfaAI extends MonsterAI {
  beastCallUsed = false;

  makeOrder(game: GameService) {
    if (!this.monster.alive) {
      return;
    }

    const result = game.getRoundResults().find(({ action }) => action === 'beastCall');
    if (result && isSuccessResult(result)) {
      this.beastCallUsed = true;
    }

    if (
      (MiscService.dice('1d100') > 33 ||
        this.monster.stats.val('hp') < this.monster.stats.val('base.hp') / 2) &&
      !this.beastCallUsed
    ) {
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
        str: Math.round(lvl * 8 + 20),
        dex: Math.round(lvl * 1 + 10),
        int: Math.round(lvl * 0.5 + 3),
        wis: Math.round(lvl * 0.5 + 3),
        con: Math.round(lvl * 12 + 20),
      },
      magics: { bleeding: 3 },
      skills: { beastCall: Math.min(Math.round(lvl / 20), 3) },
      passiveSkills: { lacerate: 3, nightcall: 1 },
      items: [claws],
      equipment: new Map([[ItemWear.TwoHands, claws]]),
    },
    MonsterType.Wolf,
    AlfaAI,
  );
  alpha.modifiers.chance.fail.paralysis = 75;

  return alpha;
};
