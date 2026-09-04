import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { soulHarvest } from './soulHarvest';

// npm t server/arena/passiveSkills/soulHarvest.test.ts

describe('soulHarvest', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    soulHarvest.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should restore MP when defeating an enemy', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { soulHarvest: 1 }, branches: ['darkness'], harks: { str: 50, dex: 10, int: 10, wis: 10, con: 10 } },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('mp', 10);
    p2.stats.set('hp', 0.1);
    attack.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThanOrEqual(0);
    expect(p1.stats.val('mp')).toBeGreaterThan(10);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
