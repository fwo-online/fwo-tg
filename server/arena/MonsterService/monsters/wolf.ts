import { ItemWear, MonsterType } from '@fwo/shared';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';

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

export const createWolf = (lvl = 1, id: string | number = '') => {
  const fang = new ItemModel(arena.items.fang);
  const wolf = MonsterService.create(
    {
      nickname: `🐺 Волк ${id.toString()}`.trimEnd(),
      harks: {
        str: Math.round(lvl * 6 + 10),
        dex: Math.round(lvl * 1 + 15),
        int: Math.round(lvl * 0.5 + 10),
        wis: Math.round(lvl * 0.5 + 10),
        con: Math.round(lvl * 6 + 15),
      },
      magics: { bleeding: 1 },
      skills: {},
      passiveSkills: { lacerate: 1, nightcall: 1 },
      items: [fang],
      equipment: new Map([[ItemWear.TwoHands, fang]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Wolf,
    WolfAI,
  );
  wolf.modifiers.chance.fail.paralysis = 90;
  wolf.modifiers.chance.fail.madness = 30;

  return wolf;
};
