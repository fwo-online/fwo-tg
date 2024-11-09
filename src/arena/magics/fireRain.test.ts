import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import { times } from 'lodash';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import TestUtils from '@/utils/testUtils';
import fireRain from './fireRain';

// npm t src/arena/magics/fireRain.test.ts

describe('fireRain', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);
  });

  beforeEach(async () => {
    const harks = { ...profsData.m.hark, wis: 20 };
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { fireRain: 3 }, harks });
    const chars = await Promise.all(times(10, () => TestUtils.createCharacter()));
    const charIds = chars.map(({ id }) => id);

    await TestUtils.createClan(charIds[1], {
      players: charIds.slice(0, 6),
    });

    TestUtils.resetCharacterCache();
    await Promise.all([initiator.id, ...charIds].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, ...charIds]);
    game.players.players.forEach((player, index) => {
      player.resists.fire = index % 3 ? 1 : 0.75;
    });
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should hit clan targets', () => {
    game.players.players[0].proc = 1;

    fireRain.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should hit single target if target has no clan', () => {
    game.players.players[0].proc = 1;

    fireRain.cast(game.players.players[0], game.players.players[8], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
