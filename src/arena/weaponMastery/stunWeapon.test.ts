import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import { protect } from '@/arena/actions';
import attack from '@/arena/actions/attack';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import stunWeapon from './stunWeapon';

// npm t src/arena/weaponMastery/stunWeapon.test.ts

describe('stunWeapon', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    attack.registerPreAffects([protect]);
    attack.registerAffectHandlers([stunWeapon]);

    initiator = await TestUtils.createCharacter({
      skills: {
        stunWeapon: 1,
      },
    }, { withWeapon: 'staff' });
    target = await TestUtils.createCharacter({
      skills: {
        dodge: 1,
      },
    });
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.25);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should hit through protect', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[1].stats.set('phys.defence', 100);

    protect.cast(game.players.players[1], game.players.players[1], game);

    spyOn(global.Math, 'random').mockReturnValue(0.05);
    attack.cast(game.players.players[0], game.players.players[1], game);

    spyOn(global.Math, 'random').mockReturnValue(0.04);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
