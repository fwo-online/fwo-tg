import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { fatalShot } from './fatalShot';

// npm t server/arena/skills/fatalShot.test.ts

describe('fatalShot', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { fatalShot: 1 }, branches: ['marksman'] },
      {},
    ]);

    TestUtils.mockRandom();
    fatalShot.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal double damage when target is below 35% HP', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    p2.stats.set('hp', 2);
    const initialHp = p2.stats.val('hp');
    fatalShot.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
