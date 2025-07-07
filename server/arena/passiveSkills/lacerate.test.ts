import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import { bleeding } from '@/arena/magics';
import TestUtils from '@/utils/testUtils';
import lacerate from './lacerate';

// npm t server/arena/passiveSkills/lacerate.test.ts

describe('lacerate', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPostAffects([lacerate]);
    game = await TestUtils.createGame([
      {
        passiveSkills: { lacerate: 1 },
        magics: { bleeding: 1 },
        harks: { int: 20, str: 10, wis: 10, con: 10, dex: 10 },
        weapon: { type: 'cut' },
      },
      {},
    ]);

    TestUtils.mockRandom();
    lacerate.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply bleeding', () => {
    game.players.players[0].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    game.round.count++;
    bleeding.castLong(game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
