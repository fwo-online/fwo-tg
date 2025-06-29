import { afterEach, beforeAll, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { engine } from '@/arena/EngineService';
import GameService from '@/arena/GameService';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { eclipse } from '@/arena/magics';
import { RoundStatus } from '@/arena/RoundService';
import { registerAffects } from '@/utils/registerAffects';
import { registerGlobals } from '@/utils/registerGlobals';
import TestUtils from '@/utils/testUtils';

describe('wolf', () => {
  let game: GameService;

  beforeEach(async () => {
    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  describe('makeOrder', () => {
    beforeAll(() => {
      registerGlobals();
      registerAffects();
    });

    beforeEach(async () => {
      const warrior = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
      const mage = await TestUtils.createCharacter({
        prof: CharacterClass.Mage,
        magics: { eclipse: 1 },
      });

      game = new GameService([warrior.id, mage.id]);
      game.players.players[1].stats.set('mp', 999);
      game.round.status = RoundStatus.START_ORDERS;
    });

    it('should attack without any conditions', () => {
      const wolf = createWolf();
      game.addPlayers([wolf]);

      wolf.ai.makeOrder(game);

      expect(game.orders.getPlayerOrders(wolf.id)).toMatchObject([{ action: 'attack' }]);
    });

    it('should howl if previous attack was blocked', () => {
      const wolf = createWolf();
      game.addPlayers([wolf]);
      wolf.stats.set('en', 100);

      eclipse.cast(game.players.players[1], game.players.players[2], game);
      wolf.ai.makeOrder(game);

      engine(game);

      game.players.reset();
      game.orders.reset();
      game.round.count++;

      wolf.ai.makeOrder(game);

      expect(game.orders.getPlayerOrders(wolf.id)).toMatchObject([{ action: 'terrifyingHowl' }]);
    });

    it('should attack if not enough energy for howl', () => {
      const wolf = createWolf();
      game.addPlayers([wolf]);

      eclipse.cast(game.players.players[1], game.players.players[2], game);
      wolf.ai.makeOrder(game);

      engine(game);

      game.players.reset();
      game.orders.reset();
      game.round.count++;

      wolf.ai.makeOrder(game);

      expect(game.orders.getPlayerOrders(wolf.id)).toMatchObject([{ action: 'attack' }]);
    });
  });
});
