import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from './attack';
import handsHeal from './handsHeal';

// npm t server/arena/actions/handsHeal.test.ts

describe('handsHeal', () => {
  let game: GameService;

  beforeEach(async () => {
    handsHeal.registerPreAffects([attack]);

    game = await TestUtils.createGame([
      { prof: CharacterClass.Warrior, weapon: {} },
      { prof: CharacterClass.Archer },
    ]);
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should heal', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 1);

    handsHeal.cast(game.players.players[0], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not heal more than max hp', () => {
    game.players.players[0].proc = 1;
    const HP = game.players.players[0].stats.val('hp');

    handsHeal.cast(game.players.players[0], game.players.players[0], game);

    expect(game.players.players[0].stats.val('hp')).toBe(HP);
  });

  it('should not get exp if players are not allies', () => {
    game.players.players[1].proc = 1;
    game.players.players[0].stats.set('hp', 1);

    handsHeal.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should be stopped by attack', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);
    handsHeal.cast(game.players.players[1], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should heal 0 if target has more than 100% HP', async () => {
    game.players.players[0].proc = 1;
    const HP = game.players.players[0].stats.val('hp') + 1;
    game.players.players[0].stats.set('hp', HP);

    handsHeal.cast(game.players.players[0], game.players.players[0], game);

    expect(game.players.players[0].stats.val('hp')).toBe(HP);
  });
});
