import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { eagleEye } from './eagleEye';

// npm t server/arena/passiveSkills/eagleEye.test.ts

describe('eagleEye', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    eagleEye.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should increase ranged weapon damage', async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, passiveSkills: { eagleEye: 1 }, branches: ['marksman'] },
      {},
    ]);

    const [archer, enemy] = game.players.players;
    archer.proc = 1;
    const initialHp = enemy.stats.val('hp');

    attack.cast(archer, enemy, game);

    expect(enemy.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
