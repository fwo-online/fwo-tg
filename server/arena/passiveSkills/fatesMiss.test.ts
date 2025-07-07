import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import fatesMiss from './fatesMiss';

// npm t server/arena/passiveSkills/fatesMiss.test.ts

describe('fatesMiss', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([fatesMiss]);
    game = await TestUtils.createGame([{ weapon: { type: 'stun' } }, {}]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should break success cast', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 100);
    game.players.players[0].stats.set('magic.attack', 100);

    attack.cast(game.players.players[0], game.players.players[1], game);
    // fatesMiss.chance[0] = 100;
    TestUtils.mockRandom(0.04);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
