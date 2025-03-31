import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import vampirism from './vampirism';
import { CharacterClass } from '@fwo/shared';

describe('vampirism', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: CharacterClass.Mage, magics: { vampirism: 2 } });
    const target = await TestUtils.createCharacter();

    game = new GameService([initiator.id, target.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should take dmg and heal on same amount', () => {
    game.players.players[0].proc = 1;

    vampirism.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[0].stats.val('hp')).toBe(11.63)
    expect(game.players.players[1].stats.val('hp')).toBe(4.37)

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should heal only above target`s 0 hp', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('hp', 1);

    vampirism.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[0].stats.val('hp')).toBe(9)
    expect(game.players.players[1].stats.val('hp')).toBe(-2.63)

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should not heal whet target`s hp less than 0', () => {
    game.players.players[0].proc = 1;
    game.players.players[1].stats.set('hp', -1);

    vampirism.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[0].stats.val('hp')).toBe(8)
    expect(game.players.players[1].stats.val('hp')).toBe(-4.63)

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
