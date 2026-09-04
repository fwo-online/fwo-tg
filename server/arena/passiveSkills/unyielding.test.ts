import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { unyielding } from './unyielding';

// npm t server/arena/passiveSkills/unyielding.test.ts

describe('unyielding', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    unyielding.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should reduce incoming damage when HP < 30%', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { unyielding: 1 }, branches: ['guardian'] },
      { weapon: {} },
    ]);

    const [defender, attacker] = game.players.players;
    attacker.proc = 1;
    defender.stats.set('hp', 2); // < 30% of max HP
    const initialHp = defender.stats.val('hp');

    attack.cast(attacker, defender, game);

    expect(defender.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
