import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { consussion } from './consussion';

// npm t server/arena/passiveSkills/consussion.test.ts

describe('consussion', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        passiveSkills: { consussion: 1 },
        weapon: { type: 'stun' },
      },
      {},
    ]);

    TestUtils.mockRandom();
    consussion.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply stun', () => {
    game.players.players[0].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);

    const effects = game.players.players[1].affects.getEffectsByAction('stun');
    expect(effects).toHaveLength(1);

    effects[0].onCast?.(game, effects[0]);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
