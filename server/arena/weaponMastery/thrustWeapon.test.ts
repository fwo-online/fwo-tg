import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import attack from '@/arena/actions/attack';
import type GameService from '@/arena/GameService';
import { dodge } from '@/arena/skills';
import TestUtils from '@/utils/testUtils';
import thrustWeapon from './thrustWeapon';

// npm t server/arena/weaponMastery/thrustWeapon.test.ts

describe('thrustWeapon', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        passiveSkills: {
          thrustWeapon: 1,
        },
        weapon: { type: 'thrust' },
      },
      { skills: { dodge: 1 } },
    ]);

    TestUtils.mockRandom(0.25);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should hit through dodge', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 20);
    game.players.players[1].stats.set('en', 100);

    dodge.cast(game.players.players[1], game.players.players[1], game);

    attack.registerPreAffects([dodge]);
    attack.cast(game.players.players[0], game.players.players[1], game);

    attack.registerAffectHandlers([thrustWeapon]);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
