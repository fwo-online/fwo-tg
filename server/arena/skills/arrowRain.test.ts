import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { arrowRain } from './arrowRain';

// npm t server/arena/skills/arrowRain.test.ts

describe('arrowRain', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { arrowRain: 1 }, branches: ['barrage'] },
      {},
      {},
    ]);

    TestUtils.mockRandom();
    arrowRain.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal damage to all enemies in team', () => {
    const [p1, p2, p3] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp2 = p2.stats.val('hp');
    const initialHp3 = p3.stats.val('hp');

    arrowRain.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp2);
    expect(p3.stats.val('hp')).toBeLessThan(initialHp3);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
