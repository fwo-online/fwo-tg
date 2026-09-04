import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { bloodRage } from './bloodRage';

// npm t server/arena/skills/bloodRage.test.ts

describe('bloodRage', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { skills: { bloodRage: 1 }, branches: ['berserker'] },
      {},
    ]);

    TestUtils.mockRandom();
    bloodRage.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should sacrifice HP and grant damage bonus buff', () => {
    const [p1] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p1.stats.val('hp');
    bloodRage.cast(p1, p1, game);

    expect(p1.stats.val('hp')).toBeLessThan(initialHp);
    const effects = p1.affects.getEffectsByAction('bloodRage');
    expect(effects).toHaveLength(1);
    expect(effects[0].value).toBe(20);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
