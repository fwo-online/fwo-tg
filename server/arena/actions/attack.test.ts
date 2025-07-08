import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from './attack';

// npm t server/arena/actions/attack.test.ts

describe('attack', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([{ weapon: {} }, {}]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should reduce damage by target resists', () => {
    game.players.players[0].proc = 1;

    game.players.players[1].resists.physical = 0;
    attack.cast(game.players.players[0], game.players.players[1], game);

    game.players.players[1].resists.physical = 0.5;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
