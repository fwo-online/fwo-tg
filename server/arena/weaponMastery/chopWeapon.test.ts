import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import attack from '@/arena/actions/attack';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import chopWeapon from './chopWeapon';

// npm t server/arena/weaponMastery/chopWeapon.test.ts

describe('chopWeapon', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([chopWeapon]);
    game = await TestUtils.createGame([
      {
        passiveSkills: { chopWeapon: 1 },
        weapon: { type: 'chop' },
      },
      {},
    ]);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should increase damage with chance', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    TestUtils.mockRandom(0.06);
    attack.cast(game.players.players[0], game.players.players[1], game);

    TestUtils.mockRandom(0.04);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
