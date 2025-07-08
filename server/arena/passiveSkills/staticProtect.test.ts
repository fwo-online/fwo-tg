import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import staticProtect from './staticProtect';

// npm t server/arena/passiveSkills/staticProtect.test.ts

describe('staticProtect', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([staticProtect]);
    game = await TestUtils.createGame([{ passiveSkills: { staticProtect: 1 }, weapon: {} }, {}]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should passively block if target has a lot of pdef', () => {
    game.players.players[0].stats.set('phys.attack', 0);
    game.players.players[1].stats.set('static.defence', 50);
    game.players.players[0].proc = 1;

    game.players.players[0].stats.set('phys.attack', 10);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(33);

    game.players.players[0].stats.set('phys.attack', 25);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(63);

    game.players.players[0].stats.set('phys.attack', 50);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(86);

    game.players.players[0].stats.set('phys.attack', 100);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(98);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
