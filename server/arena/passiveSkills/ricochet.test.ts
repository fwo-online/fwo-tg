import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';

describe('ricochet', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { ricochet: 6 }, weapon: { type: 'range' } },
      { weapon: {} },
      { weapon: {} },
      { weapon: {} },
    ]);

    TestUtils.mockRandom(0.05);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should ricochet to other enemies without hitting the same target twice', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 10);
    game.players.players[1].stats.set('hp', 50);
    game.players.players[2].stats.set('hp', 50);
    game.players.players[3].stats.set('hp', 50);

    attack.cast(game.players.players[0], game.players.players[1], game);

    const results = TestUtils.normalizeRoundHistory(game.getRoundResults());

    // Primary target (Player 2) was hit
    expect(game.players.players[1].stats.val('hp')).toBeLessThan(50);
    // Secondary targets were hit
    expect(game.players.players[2].stats.val('hp')).toBeLessThan(50);
    expect(game.players.players[3].stats.val('hp')).toBeLessThan(50);

    expect(game.players.players[0].stats.val('exp')).toBe(18 + 13 + 9);
    // Each target is hit once
    expect(results).toContain('Рикошет');
    expect(results).toMatchSnapshot();
  });

  it('should not ricochet when there are no other alive enemies', async () => {
    const duelGame = await TestUtils.createGame([
      { passiveSkills: { ricochet: 6 }, weapon: { type: 'range' } },
      { weapon: {} },
    ]);

    duelGame.players.players[0].proc = 1;
    duelGame.players.players[0].stats.set('hp', 10);
    duelGame.players.players[1].stats.set('hp', 50);

    attack.cast(duelGame.players.players[0], duelGame.players.players[1], duelGame);

    const results = TestUtils.normalizeRoundHistory(duelGame.getRoundResults());
    expect(results).not.toContain('Рикошет');
  });

  it('should not ricochet if weapon is not range', async () => {
    const meleeGame = await TestUtils.createGame([
      { passiveSkills: { ricochet: 6 }, weapon: { type: 'cut' } },
      { weapon: {} },
      { weapon: {} },
    ]);

    meleeGame.players.players[0].proc = 1;
    meleeGame.players.players[0].stats.set('hp', 10);

    attack.cast(meleeGame.players.players[0], meleeGame.players.players[1], meleeGame);

    const results = TestUtils.normalizeRoundHistory(meleeGame.getRoundResults());
    expect(results).not.toContain('Рикошет');
  });

  it('should not ricochet if chance fails', () => {
    TestUtils.restoreRandom();
    TestUtils.mockRandom(0.99); // 99 > 50%

    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 10);

    attack.cast(game.players.players[0], game.players.players[1], game);

    const results = TestUtils.normalizeRoundHistory(game.getRoundResults());
    expect(results).not.toContain('Рикошет');
  });
});
