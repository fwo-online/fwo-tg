import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import lightShield from './lightShield';

// npm t server/arena/magics/lightShield.test.ts

describe('lightShield', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPostAffects([lightShield]);
    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { lightShield: 2 },
      },
      {},
      {
        prof: CharacterClass.Warrior,
        weapon: {},
      },
    ]);

    TestUtils.mockRandom(0.3);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('initiator should be hit by light shield', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('magic.attack', 100);
    game.players.players[2].proc = 1;

    lightShield.cast(game.players.players[0], game.players.players[1], game);
    game.players.players[0].proc = 0.5;

    lightShield.cast(game.players.players[0], game.players.players[1], game);
    attack.cast(game.players.players[2], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
