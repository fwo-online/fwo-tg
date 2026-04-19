import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { huntersMark } from './huntersMark';

// npm t server/arena/passiveSkills/huntersMark.test.ts

describe('huntersMark', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        passiveSkills: { huntersMark: 1 },
        weapon: { type: 'range' },
      },
      {},
    ]);

    TestUtils.mockRandom();
    huntersMark.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply mark', () => {
    game.players.players[0].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);

    const effects = game.players.players[1].affects.getEffectsByAction(huntersMark.name);
    expect(effects).toHaveLength(1);

    huntersMark.chance[0] = 0;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
