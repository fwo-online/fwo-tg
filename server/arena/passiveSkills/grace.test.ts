import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { grace } from './grace';

// npm t server/arena/passiveSkills/grace.test.ts

describe('grace', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    grace.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should heal ally or self on weapon attack', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { grace: 1 }, branches: ['holy'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.stats.set('hp', 2);
    p1.proc = 1;
    attack.cast(p1, p2, game);

    expect(p1.stats.val('hp')).toBeGreaterThan(2);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
