import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';

// npm t server/arena/passiveSkills/retribution.test.ts

describe('retribution', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should reflect percentage of damage back to attacker', async () => {
    game = await TestUtils.createGame([
      { weapon: {} },
      { passiveSkills: { retribution: 1 }, branches: ['inquisition'] },
    ]);

    const [attacker, defender] = game.players.players;
    const initialAttackerHp = attacker.stats.val('hp');
    attacker.proc = 1;
    attack.cast(attacker, defender, game);

    expect(attacker.stats.val('hp')).toBeLessThan(initialAttackerHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
