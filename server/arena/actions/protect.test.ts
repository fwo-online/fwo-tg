import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import arena from '@/arena';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import protect from './protect';

// npm t server/arena/actions/protect.test.ts

describe('protect', () => {
  let game: GameService;

  beforeEach(async () => {
    arena.actions.attack.registerPreAffects([protect]);

    game = await TestUtils.createGame([{}, { weapon: {} }]);
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should protect player', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    protect.cast(game.players.players[0], game.players.players[0], game);
    arena.actions.attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not get exp if protect enemy', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    protect.cast(game.players.players[0], game.players.players[0], game);
    protect.cast(game.players.players[1], game.players.players[0], game);
    arena.actions.attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
