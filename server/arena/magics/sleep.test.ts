import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { handsHeal, protect } from '../actions';
import attack from '../actions/attack';
import { berserk } from '../skills';
import sleep from './sleep';

// npm t server/arena/magics/sleep.test.ts

describe('sleep', () => {
  let game: GameService;

  beforeEach(async () => {
    handsHeal.registerPreAffects([sleep]);
    protect.registerPreAffects([sleep]);
    berserk.registerPreAffects([sleep]);
    attack.registerPreAffects([sleep]);

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Mage,
        magics: { sleep: 3 },
      },
      {
        prof: CharacterClass.Warrior,
        skills: { berserk: 1 },
        weapon: {},
      },
      {
        prof: CharacterClass.Mage,
        magics: { sleep: 3 },
      },
    ]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('target should sleep and not be able to attack', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[1].proc = 0.25;

    sleep.cast(game.players.players[0], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);
    protect.cast(game.players.players[1], game.players.players[0], game);
    handsHeal.cast(game.players.players[1], game.players.players[1], game);
    berserk.cast(game.players.players[1], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should handle several casters', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);
    game.players.players[2].proc = 1;
    game.players.players[2].stats.set('mp', 99);
    game.players.players[1].proc = 0.25;

    sleep.cast(game.players.players[0], game.players.players[1], game);
    sleep.cast(game.players.players[2], game.players.players[1], game);

    attack.cast(game.players.players[1], game.players.players[0], game);
    protect.cast(game.players.players[1], game.players.players[0], game);
    handsHeal.cast(game.players.players[1], game.players.players[1], game);
    berserk.cast(game.players.players[1], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should cast long', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('mp', 99);

    sleep.cast(game.players.players[0], game.players.players[1], game);

    game.round.count++;

    sleep.castLong(game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
