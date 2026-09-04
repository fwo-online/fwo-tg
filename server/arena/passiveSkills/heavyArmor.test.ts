import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { heavyArmor } from './heavyArmor';

// npm t server/arena/passiveSkills/heavyArmor.test.ts

describe('heavyArmor', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    heavyArmor.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should reduce incoming physical damage', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { heavyArmor: 1 }, branches: ['guardian'] },
      { weapon: {} },
    ]);

    const [defender, attacker] = game.players.players;
    attacker.proc = 1;
    const initialHp = defender.stats.val('hp');

    attack.cast(attacker, defender, game);

    expect(defender.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
