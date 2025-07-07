import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import paralysis from './paralysis';

// npm t server/arena/magics/paralysis.test.ts

describe('paralysis', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([paralysis]);

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { paralysis: 3 },
      },
      {
        prof: CharacterClass.Warrior,
        weapon: {},
      },
      {
        prof: CharacterClass.Mage,
        magics: { paralysis: 3 },
      },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('initiator should be paralysed', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 1;

    paralysis.cast(game.players.players[0], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
  it('should handle several casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[2].proc = 1;
    game.players.players[2].stats.set('mp', 99);
    game.players.players[1].proc = 1;

    paralysis.cast(game.players.players[0], game.players.players[1], game);
    paralysis.cast(game.players.players[2], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
