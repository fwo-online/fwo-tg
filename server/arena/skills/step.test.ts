import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { step } from './step';

// npm t server/arena/skills/step.test.ts

describe('step', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: {}, skills: { step: 1 }, branches: ['scout'] },
      {},
    ]);

    TestUtils.mockRandom();
    step.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should trip target and apply attack reduction debuff', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p2.stats.val('hp');
    step.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    const effects = p2.affects.getEffectsByAction('step');
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
