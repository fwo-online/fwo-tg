import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { times } from 'lodash';
import type GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import TestUtils from '@/utils/testUtils';
import fireBall from './fireBall';

// npm t server/arena/magics/fireBall.test.ts

describe('fireBall', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { fireBall: 3 },
        harks: { ...profsData.m.hark, wis: 20 },
      },
      ...times(10, () => ({})),
    ]);

    const clan = await TestUtils.createClan(game.players.players[1].id, {
      players: game.players.players.slice(1, 7).map(({ id }) => id),
    });

    TestUtils.resetCharacterCache();

    game.players.players.forEach((player, index) => {
      if (clan.players.some(({ id }) => id === player.id)) {
        player.clan = clan;
      }
      player.resists.fire = index % 3 ? 1 : 0.75;
    });
  });

  beforeEach(() => {
    TestUtils.mockRandom(0.15);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should hit 6 targets', () => {
    game.players.players[0].proc = 1;

    fireBall.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit 1 target', () => {
    game.players.players[0].proc = 1;

    fireBall.cast(game.players.players[0], game.players.players[8], game);

    expect(game.players.players.map((player) => player.stats.val('hp'))).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
