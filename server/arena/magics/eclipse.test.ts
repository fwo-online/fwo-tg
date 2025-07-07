import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import eclipse from './eclipse';

// npm t server/arena/magics/eclipse.test.ts

describe('eclipse', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([eclipse]);

    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { eclipse: 3 } },
      { prof: CharacterClass.Mage, magics: { eclipse: 3 } },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('initiator should be blinded by eclipse', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[2].proc = 1;

    eclipse.cast(game.players.players[0], game.players.players[0], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle several casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('mp', 99);
    game.players.players[2].proc = 1;

    eclipse.cast(game.players.players[0], game.players.players[0], game);
    eclipse.cast(game.players.players[1], game.players.players[1], game);

    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
