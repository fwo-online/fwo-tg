import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from '../actions/attack';
import { glitch } from './glitch';

// npm t server/arena/magics/glitch.test.ts

describe('glitch', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { glitch: 3 } },
      { prof: CharacterClass.Mage, magics: { glitch: 3 } },
      { prof: CharacterClass.Mage, magics: { glitch: 3 } },
      { prof: CharacterClass.Warrior, weapon: { type: 'cut' } },
      { prof: CharacterClass.Warrior, weapon: { type: 'cut' } },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should change target on attack', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[4].proc = 1;

    glitch.cast(game.players.players[0], game.players.players[4], game);
    attack.cast(game.players.players[4], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should change target on attack if casted multiple times', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[4].proc = 1;

    glitch.cast(game.players.players[0], game.players.players[4], game);
    glitch.cast(game.players.players[1], game.players.players[4], game);
    attack.cast(game.players.players[4], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
