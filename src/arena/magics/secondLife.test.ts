import {
  describe, beforeAll, beforeEach, afterEach, it, spyOn, expect,
} from 'bun:test';
import casual from 'casual';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import secondLife from './secondLife';

// npm t src/arena/magics/secondLife.test.ts

describe('secondLife', () => {
  let game: GameService;

  beforeAll(() => {
    casual.seed(1);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'p', magics: { secondLife: 1 } });

    await CharacterService.getCharacterById(initiator.id);

    game = new GameService([initiator.id]);
  });

  beforeEach(() => {
    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('target should be alive', async () => {
    game.players.players[0].proc = 1;
    game.players.players[0].stats.set(secondLife.costType, secondLife.cost);
    game.players.players[0].stats.set('hp', -10);

    secondLife.cast(game.players.players[0], game.players.players[0], game);

    expect(game.players.players[0].stats.val('hp')).toBe(0.05);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
