import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { attack } from '@/arena/actions';
import type GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import TestUtils from '@/utils/testUtils';
import physicalSadness from './physicalSadness';

// npm t server/arena/magics/physicalSadness.test.ts

describe('physicalSadness', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { physicalSadness: 3 },
        harks: { ...profsData.m.hark, wis: 20 },
      },
      { weapon: {} },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should hit target with single hit', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    attack.cast(game.players.players[1], game.players.players[0], game);

    physicalSadness.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('hp')).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit targets with multiple hit', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 0.25;

    attack.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[1], game.players.players[0], game);

    physicalSadness.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('hp')).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not hit targets if was not any physical damage', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    const initTargetHp = game.players.players[1].stats.val('hp');

    physicalSadness.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('hp')).toEqual(initTargetHp);
    expect(game.players.players[0].stats.val('exp')).toEqual(physicalSadness.baseExp);
  });
});
