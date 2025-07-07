import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass, ItemWear } from '@fwo/shared';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import shieldBlock from './shieldBlock';

// npm t server/arena/skills/shieldBlock.test.ts

describe('shieldBlock', () => {
  let game: GameService;

  beforeEach(async () => {
    arena.actions.attack.registerPreAffects([shieldBlock]);
    const initiator = await TestUtils.createCharacter({
      prof: CharacterClass.Warrior,
      weapon: { type: 'chop' },
    });
    const target = await TestUtils.createCharacter({
      prof: CharacterClass.Warrior,
      skills: { shieldBlock: 1 },
    });

    const shield = await TestUtils.createItem({
      type: 'shield',
      wear: ItemWear.OffHand,
      phys: { defence: 10 },
    });
    target.items.push(shield);
    target.equipment.set(ItemWear.OffHand, shield);
    target.harks.con = 10;
    await target.save();
    delete arena.characters[target.id];

    await Promise.all([initiator.id, target.id].map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, target.id]);

    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should block attack if target has less attrs', async () => {
    game.players.players[0].proc = 1;

    expect(game.players.players[1].stats.val('magic.defence')).toBe(3);
    shieldBlock.cast(game.players.players[1], game.players.players[1], game);

    expect(game.players.players[1].stats.val('magic.defence')).toBe(13.67);
    arena.actions.attack.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('magic.defence')).toBe(4.87);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should breack block with multiple attacks', async () => {
    game.players.players[0].proc = 1;
    expect(game.players.players[1].stats.val('magic.defence')).toBe(3);

    shieldBlock.cast(game.players.players[1], game.players.players[1], game);

    arena.actions.attack.cast(game.players.players[0], game.players.players[1], game);
    arena.actions.attack.cast(game.players.players[0], game.players.players[1], game);
    arena.actions.attack.cast(game.players.players[0], game.players.players[1], game);

    expect(game.players.players[1].stats.val('magic.defence')).toBe(3);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
