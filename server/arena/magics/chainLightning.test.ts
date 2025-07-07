import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { times } from 'lodash';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import chainLightning from './chainLightning';

// npm t server/arena/magics/chainLightning.test.ts

describe('chainLightning', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { chainLightning: 3 } },
      ...times(10, () => ({})),
    ]);
  });

  beforeEach(() => {
    TestUtils.mockRandom(0.15);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should hit 5 targets', () => {
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit 4 targets', () => {
    game.players.players[0].magics = { chainLightning: 2 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit 3 targets', () => {
    game.players.players[0].magics = { chainLightning: 1 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit 3 targets without clan', () => {
    game.players.players[0].magics = { chainLightning: 1 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[8], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
