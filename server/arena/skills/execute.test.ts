import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { execute } from './execute';

// npm t server/arena/skills/execute.test.ts

describe('execute', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: {}, skills: { execute: 1 }, branches: ['berserker'] },
      {},
    ]);

    TestUtils.mockRandom();
    execute.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal damage and deal bonus damage when target HP is below 35%', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    p2.stats.set('hp', 2); // below 35% of default max HP
    const initialHp = p2.stats.val('hp');
    execute.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
