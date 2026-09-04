import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { criticalStrike } from './criticalStrike';

describe('criticalStrike', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { criticalStrike: 6 }, weapon: { type: 'range' } },
      { weapon: {} },
    ]);

    TestUtils.mockRandom(0.05);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal double damage on critical strike with ranged weapon', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 10);
    game.players.players[1].stats.set('hp', 100);

    const initialHp = game.players.players[1].stats.val('hp');

    attack.cast(game.players.players[0], game.players.players[1], game);

    const remainingHp = game.players.players[1].stats.val('hp');
    const damage = initialHp - remainingHp;

    expect(damage).toBeGreaterThan(0);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not crit if weapon is not range', async () => {
    const meleeGame = await TestUtils.createGame([
      { passiveSkills: { criticalStrike: 6 }, weapon: { type: 'cut' } },
      { weapon: {} },
    ]);

    meleeGame.players.players[0].proc = 1;
    meleeGame.players.players[0].stats.set('hp', 10);

    attack.cast(meleeGame.players.players[0], meleeGame.players.players[1], meleeGame);

    const results = TestUtils.normalizeRoundHistory(meleeGame.getRoundResults());
    expect(results).not.toContain('Двойной урон');
  });

  it('should not crit if chance fails', () => {
    TestUtils.restoreRandom();
    TestUtils.mockRandom(0.99); // 99 > 35% chance

    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 10);

    attack.cast(game.players.players[0], game.players.players[1], game);

    const results = TestUtils.normalizeRoundHistory(game.getRoundResults());
    expect(results).not.toContain('Двойной урон');
  });
});
