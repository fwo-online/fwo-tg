import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { engine } from '@/arena/EngineService';
import type GameService from '@/arena/GameService';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { eclipse } from '@/arena/magics';
import { RoundStatus } from '@/arena/RoundService';
import { registerAffects } from '@/utils/registerAffects';
import TestUtils from '@/utils/testUtils';

describe('wolf', () => {
  let game: GameService;

  beforeEach(async () => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  describe('makeOrder', () => {
    beforeEach(async () => {
      registerAffects();

      game = await TestUtils.createGame([
        {
          prof: CharacterClass.Warrior,
        },
        {
          prof: CharacterClass.Mage,
          magics: { eclipse: 1 },
        },
      ]);

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
