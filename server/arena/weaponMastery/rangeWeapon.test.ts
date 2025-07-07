import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import attack from '@/arena/actions/attack';
import type GameService from '@/arena/GameService';
import { dodge } from '@/arena/skills';
import TestUtils from '@/utils/testUtils';
import rangeWeapon from './rangeWeapon';

// npm t server/arena/weaponMastery/rangeWeapon.test.ts

describe('rangeWeapon', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        passiveSkills: {
          rangeWeapon: 1,
        },
        weapon: { type: 'range' },
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

  it('should hit through dodge', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 20);
    game.players.players[1].stats.set('en', 100);

    dodge.cast(game.players.players[1], game.players.players[1], game);

    attack.registerPreAffects([dodge]);
    attack.cast(game.players.players[0], game.players.players[1], game);

    attack.registerAffectHandlers([rangeWeapon]);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
