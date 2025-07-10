import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { times } from 'lodash';
import GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import TestUtils from '@/utils/testUtils';
import fireBall from './fireBall';

// npm t server/arena/magics/fireBall.test.ts

describe('fireBall', () => {
  let game: GameService;

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({
      prof: CharacterClass.Mage,
      magics: { fireBall: 3 },
      harks: { ...profsData.m.hark, wis: 20 },
    });
    const chars = await Promise.all(times(10, () => TestUtils.createCharacter({})));

    await TestUtils.createClan(chars[0], {
      players: chars.slice(0, 6),
    });

    game = new GameService([initiator.id, ...chars.map(({ id }) => id)]);

    game.players.players.forEach((player, index) => {
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
