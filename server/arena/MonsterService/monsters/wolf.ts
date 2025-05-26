import arena from '@/arena';
import type GameService from '@/arena/GameService';
import { MonsterAI, MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';
import { ItemWear, MonsterType } from '@fwo/shared';

class WolfAI extends MonsterAI {
  makeOrder(game: GameService) {
    const target = this.chooseTarget(game);

    game.orders.orderAction({
      action: 'attack',
      initiator: this.monster.id,
      target: target.id,
      proc: 100,
    });
  }

  private chooseTarget(game: GameService) {
    return game.players.alivePlayers
      .filter(({ isBot }) => !isBot)
      .reduce((target, player) => {
        if (target.stats.val('hp') < player.stats.val('hp')) {
          return target;
        }
        return player;
      });
  }
}

export const createWolf = async (lvl = 1) => {
  await ItemModel.updateOne({ code: 'test' }, arena.items.test, { upsert: true });
  const item = await ItemModel.findOne({ code: 'test' }).orFail();

  return MonsterService.create(
    {
      id: 'wolf',
      nickname: 'Волк',
      harks: {
        str: Math.round(lvl * 3 + 25),
        dex: Math.round(lvl * 2 + 16),
        int: 10,
        wis: 10,
        con: Math.round(lvl * 2 + 20),
      },
      magics: {},
      skills: {},
      passiveSkills: {},
      items: [item],
      equipment: new Map([[ItemWear.TwoHands, item]]),
    },
    MonsterType.Wolf,
    WolfAI,
  );
};
