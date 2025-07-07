import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import dodge from './dodge';

// npm t server/arena/skills/dodge.test.ts

describe('dodge', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([dodge]);

    game = await TestUtils.createGame([
      {
        weapon: { type: 'chop' },
      },
      {
        prof: CharacterClass.Archer,
        skills: { dodge: 3 },
      },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('target should dodge attack if has initiator more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 9999);

    dodge.cast(game.players.players[1], game.players.players[1], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('target should not dodge attack if target has more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('attributes.dex', 9999);

    dodge.cast(game.players.players[1], game.players.players[1], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
