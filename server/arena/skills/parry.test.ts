import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import parry from './parry';

// npm t server/arena/skills/parry.test.ts

describe('parry', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([parry]);

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Warrior,
        weapon: { type: 'chop' },
      },
      {
        prof: CharacterClass.Archer,
        skills: { parry: 3 },
      },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('target should parry attack if initiator has more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 9999);

    parry.cast(game.players.players[1], game.players.players[1], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('target should not parry attack if target has more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('attributes.dex', 9999);

    parry.cast(game.players.players[1], game.players.players[1], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
