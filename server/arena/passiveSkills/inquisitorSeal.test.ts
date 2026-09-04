import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { inquisitorSeal } from './inquisitorSeal';

// npm t server/arena/passiveSkills/inquisitorSeal.test.ts

describe('inquisitorSeal', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    inquisitorSeal.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should burn MP/energy and apply silence', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { inquisitorSeal: 1 }, branches: ['inquisition'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p2.stats.set('mp', 50);
    p2.stats.set('en', 50);
    attack.cast(p1, p2, game);

    expect(p2.stats.val('mp')).toBeLessThan(50);
    const silenceEffects = p2.affects.getEffectsByAction('silence');
    expect(silenceEffects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
