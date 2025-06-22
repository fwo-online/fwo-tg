import arena from '@/arena';
import type GameService from '@/arena/GameService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';
import { ItemWear, MonsterType } from '@fwo/shared';

class AlfaAI extends MonsterAI {
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
    if (targets.length) {
      return targets.reduce((target, player) => {
        if (target.stats.val('hp') < player.stats.val('hp')) {
          return target;
        }
        return player;
      });
    }
  }
}

export const createAlpha = async (lvl = 1) => {
  const claws = await ItemModel.findOneAndUpdate({ code: 'claws' }, arena.items.fang, {
    upsert: true,
    new: true,
  }).orFail();

  return MonsterService.create(
    {
      nickname: '🐺Альфа',
      harks: {
        str: Math.round(lvl * 6 + 20),
        dex: Math.round(lvl * 1 + 10),
        int: Math.round(lvl * 0.5 + 3),
        wis: Math.round(lvl * 0.5 + 3),
        con: Math.round(lvl * 6 + 20),
      },
      magics: { bleeding: 3 },
      skills: {},
      passiveSkills: { lacerate: 3, nightcall: 1 },
      items: [claws],
      equipment: new Map([[ItemWear.TwoHands, claws]]),
    },
    MonsterType.Wolf,
    AlfaAI,
  );
};
