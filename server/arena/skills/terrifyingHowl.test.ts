import { afterEach, beforeAll, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { CharacterClass, ItemWear } from '@fwo/shared';
import casual from 'casual';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import { eclipse, paralysis } from '@/arena/magics';
import TestUtils from '@/utils/testUtils';
import attack from '../actions/attack';
import terrifyingHowl from './terrifyingHowl';

// npm t server/arena/skills/terrifyingHowl.test.ts

describe('terrifyingHowl', () => {
  let game: GameService;

  beforeAll(() => {
    attack.registerPreAffects([paralysis]);
    eclipse.registerPreAffects([paralysis]);
    casual.seed(1);
  });

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({
      prof: CharacterClass.Warrior,
      skills: { terrifyingHowl: 2 },
    });
    const target1 = await TestUtils.createCharacter({
      prof: CharacterClass.Mage,
      magics: { eclipse: 1 },
    });
    const target2 = await TestUtils.createCharacter({});

    game = new GameService([initiator.id, target1.id, target2.id]);

    spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    spyOn(global.Math, 'random').mockRestore();
  });

  it('should apply paralysis', async () => {
    game.players.players[0].proc = 1;
    game.players.players[1].proc = 1;
    game.players.players[0].stats.set('en', 999);
    game.players.players[1].stats.set('mp', 999);
    terrifyingHowl.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].flags.isParalysed).toHaveLength(1);
    expect(game.players.players[2].flags.isParalysed).toHaveLength(1);

    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
