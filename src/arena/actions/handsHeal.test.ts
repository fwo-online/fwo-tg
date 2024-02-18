import casual from 'casual';
import GameService from '@/arena/GameService';
import { type Char } from '@/models/character';
import TestUtils from '@/utils/testUtils';
import attack from './attack';
import handsHeal from './handsHeal';

// npm t src/arena/actions/handsHeal.test.ts

describe('protect', () => {
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

  it('should heal', () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set('hp', 1);

    handsHeal.cast(game.players.players[0], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not heal more than max hp', () => {
    game.players.players[0].proc = 1;

    handsHeal.cast(game.players.players[0], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not get exp if players are not allies', () => {
    game.players.players[1].proc = 1;
    game.players.players[0].stats.set('hp', 1);

    handsHeal.cast(game.players.players[1], game.players.players[0], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should be stopped by attack', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;

    attack.cast(game.players.players[0], game.players.players[1], game);
    handsHeal.cast(game.players.players[1], game.players.players[1], game);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
