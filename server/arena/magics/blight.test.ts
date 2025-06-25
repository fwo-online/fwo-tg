import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import blight from './blight';
// npm t server/arena/magics/blight.test.ts

describe('blight', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    const harks = { ...profsData.m.hark, wis: 20 };

    initiator = await TestUtils.createCharacter({ prof: 'm', magics: { blight: 3 }, harks });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should hit percentage damage', () => {
    game.players.players[0].proc = 1;

    blight.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('hp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
