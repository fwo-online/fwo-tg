import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { deathEcho } from './deathEcho';

// npm t server/arena/passiveSkills/deathEcho.test.ts

describe('deathEcho', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should decrease stats on cast', async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { deathEcho: 1 } },
      {},
    ]);

    const p1 = game.players.players[0];
    const initialPhysAtk = p1.stats.val('phys.attack');
    deathEcho.onCast({ initiator: p1, target: p1, game });

    expect(p1.stats.val('phys.attack')).toBeLessThan(initialPhysAtk);
  });
});
