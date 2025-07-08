import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import beastCall from '@/arena/skills/beastCall';
import TestUtils from '@/utils/testUtils';

// npm t server/arena/skills/beastCall.test.ts

describe('beastCall', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Warrior, skills: { beastCall: 2 }, weapon: {} },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(async () => {
    TestUtils.restoreRandom();
  });

  it('should create wolfs', async () => {
    game.players.players[0].proc = 0.5;

    beastCall.cast(game.players.players[0], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
    expect(game.players.players.length).toBe(4);
    expect(game.players.players).toMatchObject([
      { nick: game.players.players[0].nick },
      { nick: '🐺 Волк 1' },
      { nick: '🐺 Волк 2' },
      { nick: '🐺 Волк 3' },
    ]);
  });
});
