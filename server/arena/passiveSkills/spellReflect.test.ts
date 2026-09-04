import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { magicArrow } from '@/arena/magics';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { spellReflect } from './spellReflect';

// npm t server/arena/passiveSkills/spellReflect.test.ts

describe('spellReflect', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    spellReflect.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should absorb hostile magic and reflect damage to caster', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { magicArrow: 1 } },
      { passiveSkills: { spellReflect: 1 }, branches: ['protection'] },
    ]);

    const [caster, defender] = game.players.players;
    const initialDefenderHp = defender.stats.val('hp');
    const initialCasterHp = caster.stats.val('hp');
    caster.proc = 1;
    caster.stats.set('mp', 100);

    magicArrow.cast(caster, defender, game);

    // Защитник поглотил урон, кастер получил отраженный урон
    expect(defender.stats.val('hp')).toBe(initialDefenderHp);
    expect(caster.stats.val('hp')).toBeLessThan(initialCasterHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
