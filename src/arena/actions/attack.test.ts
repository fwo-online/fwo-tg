import casual from 'casual';
import CharacterService from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import { profsData } from '@/data/profs';
import TestUtils from '@/utils/testUtils';
import attack from './attack';

// npm t src/arena/actions/attack.test.ts

describe('attack', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);
  });

  beforeEach(async () => {
    const harks = { ...profsData.m.hark, wis: 20 };
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { fireBall: 3 }, harks }, { withWeapon: true });
    const target = await TestUtils.createCharacter({ skills: { dodge: 3 } });

    await Promise.all([initiator.id, target.id].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.15);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should dodge', () => {
    game.players.players[0].proc = 1;

    game.players.players[1].flags.isDodging = Infinity;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect( TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });



  it('should not dodge', () => {
    game.players.players[0].proc = 1;

    game.players.players[1].flags.isDodging = -Infinity;
    attack.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
