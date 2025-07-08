import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { protect } from '@/arena/actions';
import attack from '@/arena/actions/attack';
import type GameService from '@/arena/GameService';
import stunWeapon from '@/arena/weaponMastery/stunWeapon';
import TestUtils from '@/utils/testUtils';

// npm t server/arena/weaponMastery/stunWeapon.test.ts

describe('stunWeapon', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([protect]);
    attack.registerAffectHandlers([stunWeapon]);

    game = await TestUtils.createGame([
      {
        passiveSkills: {
          stunWeapon: 1,
        },
        weapon: { type: 'stun' },
      },
      {
        skills: {
          dodge: 1,
        },
      },
    ]);

    TestUtils.mockRandom(0.25);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should hit through protect', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('phys.defence', 100);

    protect.cast(game.players.players[1], game.players.players[1], game);

    TestUtils.mockRandom(0.05);
    attack.cast(game.players.players[0], game.players.players[1], game);

    TestUtils.mockRandom(0.04);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
