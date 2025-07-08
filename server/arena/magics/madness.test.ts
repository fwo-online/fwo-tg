import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import madness from './madness';

// npm t server/arena/magics/madness.test.ts

describe('madness', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([madness]);

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { madness: 2 },
      },
      {
        prof: CharacterClass.Mage,
        magics: { madness: 2 },
      },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should change target', async () => {
    game.players.players[0].proc = 1;
    game.players.players[2].proc = 1;

    madness.cast(game.players.players[0], game.players.players[2], game);
    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle multiple casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[2].proc = 1;

    madness.cast(game.players.players[0], game.players.players[2], game);
    madness.cast(game.players.players[1], game.players.players[2], game);
    attack.cast(game.players.players[2], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
