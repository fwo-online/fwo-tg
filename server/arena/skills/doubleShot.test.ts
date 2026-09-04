import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { doubleShot } from './doubleShot';

// npm t server/arena/skills/doubleShot.test.ts

describe('doubleShot', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { doubleShot: 1 }, branches: ['barrage'] },
      {},
      {},
    ]);

    TestUtils.mockRandom();
    doubleShot.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should fire arrows dealing damage', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p2.stats.val('hp');
    doubleShot.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
