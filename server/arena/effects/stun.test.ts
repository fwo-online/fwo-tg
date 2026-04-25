import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { stun } from './stun';

// npm t server/arena/effects/stun.test.ts

describe('stun', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        weapon: { type: 'stun' },
      },
      {},
      {},
    ]);

    TestUtils.mockRandom();
    stun.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should block next action', () => {
    game.players.players[0].affects.addEffect({
      action: stun.name,
      initiator: game.players.players[2],
      onBeforeAction(ctx, action, affect) {
        stun.onBeforeAction(ctx, action, affect);
      },
    });

    const effects = game.players.players[0].affects.getEffectsByAction('stun');
    expect(effects).toHaveLength(1);

    game.players.players[0].proc = 1;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
