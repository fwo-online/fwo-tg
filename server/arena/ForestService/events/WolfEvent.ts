import type { Reward } from '@fwo/shared';
import { ForestEvent } from '@/arena/ForestService/ForestEvent';
import MiscService from '@/arena/MiscService';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { createGame } from '@/helpers/gameHelper';

export class WolfEvent extends ForestEvent {
  duration = 30 * 1000;

  getReward(): MaybePromise<Reward> {
    return {
      exp: MiscService.randInt(250, 500),
      components: {
        leather: MiscService.randInt(1, 3),
      },
    };
  }

  override async accept(): Promise<void> {
    const game = await createGame([this.character.id], this.character.chat);

    if (!game) {
      return;
    }

    const wolf = createWolf(this.character.lvl);

    game.on('startOrders', () => {
      wolf.ai.makeOrder(game);
    });

    game.addPlayers([wolf]);

    game.on('end', () => {
      super.accept();
    });

    this.emit('figth', this, game);
  }
}
