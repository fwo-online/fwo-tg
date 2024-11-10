import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import { attack } from '@/arena/actions';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import staticProtect from './staticProtect';

// npm t src/arena/passiveSkills/staticProtect.test.ts

describe('staticProtect', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    attack.registerPreAffects([staticProtect]);

    initiator = await TestUtils.createCharacter({}, { withWeapon: true });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should passively block if target has a lot of pdef', () => {
    game.players.players[0].stats.set('phys.attack', 0);
    game.players.players[1].stats.set('static.defence', 50);
    game.players.players[0].proc = 1;

    game.players.players[0].stats.set('phys.attack', 10);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(33);

    game.players.players[0].stats.set('phys.attack', 25);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(63);

    game.players.players[0].stats.set('phys.attack', 50);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(86);

    game.players.players[0].stats.set('phys.attack', 100);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(staticProtect.getChance()).toBe(98);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
