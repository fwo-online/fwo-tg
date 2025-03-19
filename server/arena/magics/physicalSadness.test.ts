import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import { attack } from '@/arena/actions';
import GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import physicalSadness from './physicalSadness';

// npm t server/arena/magics/physicalSadness.test.ts

describe('physicalSadness', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    const harks = { ...profsData.m.hark, wis: 20 };

    initiator = await TestUtils.createCharacter({
      prof: 'm',
      magics: { physicalSadness: 1 },
      harks,
    });
    target = await TestUtils.createCharacter({}, { weapon: {} });
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
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
