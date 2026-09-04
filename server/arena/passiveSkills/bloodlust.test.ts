import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { bloodlust } from './bloodlust';

// npm t server/arena/passiveSkills/bloodlust.test.ts

describe('bloodlust', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    bloodlust.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should restore energy and HP on killing enemy', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { bloodlust: 1 }, branches: ['berserker'] },
      {},
    ]);

    const [killer, victim] = game.players.players;
    killer.proc = 1;
    killer.stats.set('en', 10);
    victim.stats.set('hp', 1); // 1 HP, dies on attack

    attack.cast(killer, victim, game);

    expect(victim.stats.val('hp')).toBeLessThanOrEqual(0);
    expect(killer.stats.val('en')).toBeGreaterThan(10);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
