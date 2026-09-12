import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from '../actions/attack';
import { poisonArrow } from './poisonArrow';

// npm t arena/skills/poisonArrow.test.ts

describe('poisonArrow', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { poisonArrow: 1 } },
      {},
    ]);

    TestUtils.mockRandom();
    poisonArrow.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should buff next ranged attack with acid and apply poison DoT effect', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);
    p2.stats.set('hp', 100);

    const initialHp = p2.stats.val('hp');
    poisonArrow.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    const effects = p2.affects.getEffectsByAction('poison');
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
