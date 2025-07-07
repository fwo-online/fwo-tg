import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { protect } from '@/arena/actions';
import attack from '@/arena/actions/attack';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import cutWeapon from './cutWeapon';

// npm t server/arena/weaponMastery/cutWeapon.test.ts

describe('cutWeapon', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([protect]);
    attack.registerAffectHandlers([cutWeapon]);

    game = await TestUtils.createGame([
      {
        passiveSkills: { cutWeapon: 1 },
        weapon: { type: 'cut' },
      },
      {
        skills: { dodge: 1 },
      },
    ]);
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
