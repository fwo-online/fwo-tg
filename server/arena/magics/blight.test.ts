import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import TestUtils from '@/utils/testUtils';
import blight from './blight';

// npm t server/arena/magics/blight.test.ts

describe('blight', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { blight: 3 },
        harks: { ...profsData[CharacterClass.Mage].hark, wis: 20 },
      },
      {},
    ]);
  });

  beforeEach(() => {
    TestUtils.mockRandom(0.15);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should hit percentage damage', () => {
    game.players.players[0].proc = 1;

    blight.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('hp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
