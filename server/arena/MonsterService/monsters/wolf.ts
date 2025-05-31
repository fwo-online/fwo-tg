import arena from '@/arena';
import type GameService from '@/arena/GameService';
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

export const createWolf = async (lvl = 1) => {
  const fang = await ItemModel.findOneAndUpdate({ code: 'fang' }, arena.items.fang, {
    upsert: true,
    new: true,
  }).orFail();
  const claws = await ItemModel.findOneAndUpdate({ code: 'claws' }, arena.items.fang, {
    upsert: true,
    new: true,
  }).orFail();

  return MonsterService.create(
    {
      id: 'wolf',
      nickname: '🐺Волк',
      harks: {
        str: Math.round(lvl * 4 + 20),
        dex: Math.round(lvl * 1 + 10),
        int: Math.round(lvl * 0.5 + 3),
        wis: Math.round(lvl * 0.5 + 3),
        con: Math.round(lvl * 4 + 20),
      },
      magics: { bleeding: Math.min(Math.round(lvl / 10), 3) },
      skills: {},
      passiveSkills: { lacerate: Math.min(Math.round(lvl / 10), 3) },
      items: [fang, claws],
      equipment: new Map([[ItemWear.TwoHands, fang]]),
    },
    MonsterType.Wolf,
    WolfAI,
  );
};
