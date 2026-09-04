import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { secondAttack } from './secondAttack';

// npm t server/arena/passiveSkills/secondAttack.test.ts

describe('secondAttack', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    secondAttack.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should fire a second arrow on ranged weapon attack', async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, passiveSkills: { secondAttack: 1 }, branches: ['barrage'] },
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
