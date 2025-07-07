import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import bodySpirit from './bodySpirit';

// npm t server/arena/magics/bodySpirit.test.ts

describe('bodySpirit', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { bodySpirit: 3 } },
      {},
    ]);
  });

  beforeEach(() => {
    TestUtils.mockRandom(0.15);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should hit target and get mp', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', bodySpirit.cost);

    bodySpirit.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('mp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not kill target', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', bodySpirit.cost);
    game.players.players[1].stats.set('hp', 0.1);

    bodySpirit.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('mp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should take 0 damage if target hp less than 0.5', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', bodySpirit.cost);
    game.players.players[1].stats.set('hp', 0.1);

    bodySpirit.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('mp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
