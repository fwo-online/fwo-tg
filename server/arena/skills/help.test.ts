import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { help } from './help';

// npm t server/arena/skills/help.test.ts

describe('help', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { skills: { help: 1 }, branches: ['guardian'] },
      { weapon: {} },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
    help.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should intercept damage intended for ally', () => {
    const [tank, ally, enemy] = game.players.players;
    tank.proc = 1;
    tank.stats.set('en', 50);
    enemy.proc = 1;

    help.cast(tank, ally, game);

    const allyInitialHp = ally.stats.val('hp');
    const tankInitialHp = tank.stats.val('hp');

    attack.cast(enemy, ally, game);

    expect(ally.stats.val('hp')).toBe(allyInitialHp);
    expect(tank.stats.val('hp')).toBeLessThan(tankInitialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
