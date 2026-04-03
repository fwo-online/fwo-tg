import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from '../actions/attack';
import terrifyingHowl from './terrifyingHowl';

// npm t server/arena/skills/terrifyingHowl.test.ts

describe('terrifyingHowl', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Warrior,
        skills: { terrifyingHowl: 2 },
      },
      {
        prof: CharacterClass.Warrior,
        weapon: { type: 'cut ' },
      },
      {},
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply paralysis', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[0].stats.set('en', 999);
    game.players.players[1].stats.set('mp', 999);
    terrifyingHowl.cast(game.players.players[0], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
