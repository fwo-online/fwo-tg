import { describe, beforeAll, beforeEach, afterEach, it, spyOn, expect } from 'bun:test';
import casual from 'casual';
import attack from '@/arena/actions/attack';
import GameService from '@/arena/GameService';
import { dodge } from '@/arena/skills';
import type { Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import thrustWeapon from './thrustWeapon';

// npm t server/arena/weaponMastery/thrustWeapon.test.ts

describe('thrustWeapon', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);

    initiator = await TestUtils.createCharacter(
      {
        passiveSkills: {
          thrustWeapon: 1,
        },
      },
      { weapon: { type: 'thrust' } },
    );
    target = await TestUtils.createCharacter({
      skills: {
        dodge: 1,
      },
    });
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.25);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should hit through dodge', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('attributes.dex', 20);
    game.players.players[1].stats.set('en', 100);

    dodge.cast(game.players.players[1], game.players.players[1], game);

    attack.registerPreAffects([dodge]);
    attack.cast(game.players.players[0], game.players.players[1], game);

    attack.registerAffectHandlers([thrustWeapon]);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
