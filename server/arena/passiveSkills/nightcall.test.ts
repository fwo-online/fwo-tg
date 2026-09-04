import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { sleep } from '@/arena/magics';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { nightcall } from './nightcall';

// npm t server/arena/passiveSkills/nightcall.test.ts

describe('nightcall', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should prevent sleep from affecting target', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { sleep: 1 } },
      { passiveSkills: { nightcall: 1 } },
    ]);

    const [caster, defender] = game.players.players;
    const ctx = { params: { initiator: defender, target: defender, game } } as any;

    expect(() => nightcall.onBeforeAction(ctx, sleep)).toThrow();
  });
});
