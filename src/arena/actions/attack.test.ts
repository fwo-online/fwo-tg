import casual from 'casual';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import attack from './attack';
import handsHeal from './handsHeal';

// npm t src/arena/actions/attack.test.ts

describe('attack', () => {
  let game: GameService;
  let initiator: Char;
  let target: Char;

  beforeAll(async () => {
    casual.seed(1);
    handsHeal.registerPreAffects([attack]);

    initiator = await TestUtils.createCharacter({}, { withWeapon: true });
    target = await TestUtils.createCharacter();
  });

  beforeEach(async () => {
    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should passively block if target has a lot of pdef', () => {
    game.players.players[0].stats.set('patk', 0);
    game.players.players[1].stats.set('pdef', 50);
    game.players.players[0].proc = 1;

    game.players.players[0].stats.set('atk', 10);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(attack.getChance()).toBe(33);

    game.players.players[0].stats.set('atk', 25);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(attack.getChance()).toBe(63);

    game.players.players[0].stats.set('atk', 50);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(attack.getChance()).toBe(86);

    game.players.players[0].stats.set('atk', 100);
    attack.cast(game.players.players[0], game.players.players[1], game);
    expect(attack.getChance()).toBe(98);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should reduce damage by target resists', () => {
    game.players.players[0].proc = 1;

    game.players.players[1].resists.physical = 0;
    attack.cast(game.players.players[0], game.players.players[1], game);

    game.players.players[1].resists.physical = 0.5;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
