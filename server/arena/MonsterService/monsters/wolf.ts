import arena from '@/arena';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';
import { ItemWear, MonsterType } from '@fwo/shared';

class WolfAI extends MonsterAI {
  makeOrder(game: GameService) {
    if (!this.monster.alive) {
      return;
    }

    const target = this.chooseTarget(game);

    if (!target) {
      return;
    }

    game.orders.orderAction({
      action: 'attack',
      initiator: this.monster.id,
      target: target.id,
      proc: 100,
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

export const createWolf = (lvl = 1, id = '') => {
  const fang = new ItemModel(arena.items.fang);
  return MonsterService.create(
    {
      nickname: `🐺 Волк ${id}`.trimEnd(),
      harks: {
        str: Math.round(lvl * 4 + 20),
        dex: Math.round(lvl * 1 + 10),
        int: Math.round(lvl * 0.5 + 3),
        wis: Math.round(lvl * 0.5 + 3),
        con: Math.round(lvl * 4 + 20),
      },
      magics: { bleeding: 1 },
      skills: {},
      passiveSkills: { lacerate: 1, nightcall: 1 },
      items: [fang],
      equipment: new Map([[ItemWear.TwoHands, fang]]),
    },
    MonsterType.Wolf,
    WolfAI,
  );
};
