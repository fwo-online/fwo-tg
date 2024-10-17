import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import attack from '@/arena/actions/attack';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import healingWeapon from './healingWeapon';

// npm t src/arena/weaponMastery/healingWeapon.test.ts

describe('healingWeapon', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);

    attack.registerPreAffects([healingWeapon]);

    initiator = await TestUtils.createCharacter({
      skills: {
        healingWeapon: 1,
      },
    }, { withWeapon: 'a27' });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.01);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should increase damage with chance', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    spyOn(global.Math, 'random').mockReturnValue(0.05);
    attack.cast(game.players.players[0], game.players.players[1], game);

    spyOn(global.Math, 'random').mockReturnValue(0.04);
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
