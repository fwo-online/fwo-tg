import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { riposte } from './riposte';

// npm t server/arena/passiveSkills/riposte.test.ts

describe('riposte', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    riposte.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should counterattack when receiving physical damage', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { riposte: 1 }, branches: ['duelist'] },
      { weapon: {} },
    ]);

    const [duelist, attacker] = game.players.players;
    attacker.proc = 1;
    const attackerInitialHp = attacker.stats.val('hp');

    attack.cast(attacker, duelist, game);

    expect(attacker.stats.val('hp')).toBeLessThan(attackerInitialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
