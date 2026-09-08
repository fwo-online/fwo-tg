import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { step } from './step';

// npm t server/arena/skills/step.test.ts

describe('step', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: {}, skills: { step: 1 } },
      {},
    ]);

    TestUtils.mockRandom();
    step.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should trip target and reduce target phys.defence and phys.attack in current round', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);
    p2.stats.set('phys.defence', 100);
    p2.stats.set('phys.attack', 100);

    step.cast(p1, p2, game);

    // level 1: wpr * 0.60, wat * (0.60 + 0.20) = 0.80
    expect(p2.stats.val('phys.defence')).toBe(60);
    expect(p2.stats.val('phys.attack')).toBe(80);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
