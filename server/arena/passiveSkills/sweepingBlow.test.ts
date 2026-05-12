import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';

// npm t server/arena/passiveSkills/sweepingBlow.test.ts

describe('sweepingBlow', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { sweepingBlow: 3 }, weapon: { type: 'cut' } },
      { weapon: {} },
      { weapon: {} },
    ]);

    TestUtils.mockRandom(0.4);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should passively hit random enemy', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 1);

    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
  });
});
