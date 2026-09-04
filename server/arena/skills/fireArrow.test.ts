import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { fireArrow } from './fireArrow';

// npm t server/arena/skills/fireArrow.test.ts

describe('fireArrow', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { fireArrow: 1 }, branches: ['barrage'] },
      {},
    ]);

    TestUtils.mockRandom();
    fireArrow.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal damage and apply burning DoT effect', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p2.stats.val('hp');
    fireArrow.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    const effects = p2.affects.getEffectsByAction('burning');
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
