import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass, ItemWear } from '@fwo/shared';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { shieldBash } from './shieldBash';

// npm t server/arena/skills/shieldBash.test.ts

describe('shieldBash', () => {
  let game: GameService;

  beforeEach(async () => {
    const shield = await TestUtils.createItem({
      type: 'shield',
      wear: ItemWear.OffHand,
      phys: { defence: 10 },
    });

    game = await TestUtils.createGame([
      {
        prof: CharacterClass.Warrior,
        skills: { shieldBash: 1 },
        items: [shield],
        equipment: new Map([[ItemWear.OffHand, shield]]),
      },
      {},
    ]);

    TestUtils.mockRandom();
    shieldBash.chance[0] = 100;
    shieldBash.stunChance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should deal damage and stun target', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    const initialHp = p2.stats.val('hp');
    shieldBash.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    const effects = p2.affects.getEffectsByAction('stun');
    expect(effects.length).toBeGreaterThanOrEqual(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
