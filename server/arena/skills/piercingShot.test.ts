import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { piercingShot } from './piercingShot';

// npm t server/arena/skills/piercingShot.test.ts

describe('piercingShot', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { piercingShot: 1 }, branches: ['marksman'] },
      { stats: { 'phys.defence': 20 } },
    ]);

    TestUtils.mockRandom();
    piercingShot.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal damage penetrating target defence', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p2.stats.val('hp');
    piercingShot.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
