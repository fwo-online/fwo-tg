import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { fieldMedic } from './fieldMedic';

// npm t server/arena/skills/fieldMedic.test.ts

describe('fieldMedic', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { skills: { fieldMedic: 1 }, branches: ['scout'] },
      {},
    ]);

    TestUtils.mockRandom();
    fieldMedic.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should heal ally with energy', () => {
    const [p1] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);
    p1.stats.set('hp', 2); // wounded

    fieldMedic.cast(p1, p1, game);

    expect(p1.stats.val('hp')).toBeGreaterThan(2);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
