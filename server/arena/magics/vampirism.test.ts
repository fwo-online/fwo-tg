import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import vampirism from './vampirism';

describe('vampirism', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { vampirism: 2 } },
      {},
    ]);
  });

  beforeEach(() => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should take dmg and heal on same amount', () => {
    game.players.players[0].proc = 1;

    vampirism.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[0].stats.val('hp')).toBe(11.63);
    expect(game.players.players[1].stats.val('hp')).toBe(4.37);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should heal only above target`s 0 hp', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('hp', 1);

    vampirism.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[0].stats.val('hp')).toBe(9);
    expect(game.players.players[1].stats.val('hp')).toBe(-2.63);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not heal whet target`s hp less than 0', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('hp', -1);

    vampirism.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[0].stats.val('hp')).toBe(8);
    expect(game.players.players[1].stats.val('hp')).toBe(-4.63);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
