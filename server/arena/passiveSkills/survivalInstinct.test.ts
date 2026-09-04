import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { survivalInstinct } from './survivalInstinct';

// npm t server/arena/passiveSkills/survivalInstinct.test.ts

describe('survivalInstinct', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    survivalInstinct.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should reduce incoming damage when HP < 35%', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { survivalInstinct: 1 }, branches: ['scout'] },
      { weapon: {} },
    ]);

    const [scout, attacker] = game.players.players;
    attacker.proc = 1;
    scout.stats.set('hp', 2); // below 35%
    const initialHp = scout.stats.val('hp');

    attack.cast(attacker, scout, game);

    expect(scout.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
