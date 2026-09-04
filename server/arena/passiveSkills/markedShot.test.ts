import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { markedShot } from './markedShot';

// npm t server/arena/passiveSkills/markedShot.test.ts

describe('markedShot', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should increase physical damage if target has mark', async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' } },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;

    const ctx = {
      params: { initiator: p1, target: p2, game },
      initiator: p1,
      target: p2,
      game,
      status: { effect: 20, exp: 0, expArr: [], affects: [] },
      addAffect: () => {},
    } as any;

    const affect = { initiator: p1, value: 50 } as any;
    markedShot.onBeforeDamageRecieve(ctx, attack, affect);

    expect(ctx.status.effect).toBeGreaterThan(20);
  });
});
