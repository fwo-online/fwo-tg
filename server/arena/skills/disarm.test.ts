import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import disarm from './disarm';

// npm t server/arena/skills/disarm.test.ts

describe('disarm', () => {
  let game: GameService;

  beforeEach(async () => {
    attack.registerPreAffects([disarm]);

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Warrior,
        weapon: {},
      },
      {
        prof: CharacterClass.Archer,
        skills: { disarm: 3 },
      },
      {
        prof: CharacterClass.Archer,
        skills: { disarm: 3 },
      },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('target should be disarmed if initiator has more dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 9999);

    disarm.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('target should not be disarmed if initiator has less dex', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('attributes.dex', 9999);

    disarm.cast(game.players.players[1], game.players.players[0], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle several casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 9999);
    game.players.players[2].stats.set('attributes.dex', 9999);

    disarm.cast(game.players.players[1], game.players.players[0], game);
    disarm.cast(game.players.players[2], game.players.players[0], game);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
