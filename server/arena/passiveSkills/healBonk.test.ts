import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';

// npm t server/arena/passiveSkills/healBonk.test.ts

describe('healBonk', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { healBonk: 3 }, weapon: { type: 'heal' } },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should passively heal ally', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 1);

    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
