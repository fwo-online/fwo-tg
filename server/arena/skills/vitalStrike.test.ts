import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { vitalStrike } from './vitalStrike';

// npm t server/arena/skills/vitalStrike.test.ts

describe('vitalStrike', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: {}, skills: { vitalStrike: 1 }, branches: ['duelist'] },
      {},
    ]);

    TestUtils.mockRandom();
    vitalStrike.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal increased physical damage to target', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p2.stats.val('hp');
    vitalStrike.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
