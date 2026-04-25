import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { asleep } from './asleep';

// npm t server/arena/effects/asleep.test.ts

describe('sleep', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        weapon: { type: 'asleep' },
      },
      {},
      {},
    ]);

    TestUtils.mockRandom();
    asleep.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should block next action', () => {
    game.players.players[0].affects.addEffect({
      action: asleep.name,
      initiator: game.players.players[2],
      onBeforeAction(ctx, action, affect) {
        asleep.onBeforeAction(ctx, action, affect);
      },
    });

    const effects = game.players.players[0].affects.getEffectsByAction('asleep');
    expect(effects).toHaveLength(1);

    game.players.players[0].proc = 1;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
