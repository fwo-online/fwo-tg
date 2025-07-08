import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import { eclipse, paralysis } from '@/arena/magics';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import terrifyingHowl from './terrifyingHowl';

// npm t server/arena/skills/terrifyingHowl.test.ts

describe('terrifyingHowl', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([paralysis]);
    eclipse.registerPreAffects([paralysis]);

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Warrior,
        skills: { terrifyingHowl: 2 },
      },
      {
        prof: CharacterClass.Mage,
        magics: { eclipse: 1 },
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

    expect(game.players.players[1].flags.isParalysed).toHaveLength(1);
    expect(game.players.players[2].flags.isParalysed).toHaveLength(1);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
