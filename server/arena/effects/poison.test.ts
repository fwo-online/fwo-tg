import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { poison } from './poison';

// npm t arena/effects/poison.test.ts

describe('poison', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([{}, {}]);

    TestUtils.mockRandom();
    poison.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal acid damage when ticking', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    const initialHp = p2.stats.val('hp');
    poison.duration = 2;
    poison.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
