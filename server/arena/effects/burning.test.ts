import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { burning } from './burning';

// npm t server/arena/effects/burning.test.ts

describe('burning', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {},
      {},
    ]);

    TestUtils.mockRandom();
    burning.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal fire damage when ticking', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    const initialHp = p2.stats.val('hp');
    burning.duration = 2;
    burning.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should deal specified damage value when provided', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    const initialHp = p2.stats.val('hp');
    burning.duration = 1;
    burning.cast(p1, p2, game, 3);

    expect(p2.stats.val('hp')).toBe(initialHp - 3);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
