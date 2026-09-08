import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { eagleEye } from './eagleEye';

// npm t arena/passiveSkills/eagleEye.test.ts

describe('eagleEye', () => {
  let game: GameService;

  beforeEach(() => {
    eagleEye.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should counter miss when shooting with ranged weapon', async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, passiveSkills: { eagleEye: 1 } },
      {},
    ]);

    const [archer, enemy] = game.players.players;
    archer.proc = 1;
    const initialHp = enemy.stats.val('hp');

    // Mock random so fatesMiss triggers (<= 5)
    TestUtils.mockRandom(0.02);
    attack.cast(archer, enemy, game);

    // With eagleEye countering miss, damage is dealt!
    expect(enemy.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
