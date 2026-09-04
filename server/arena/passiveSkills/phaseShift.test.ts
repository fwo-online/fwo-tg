import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { magicArrow } from '@/arena/magics';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { phaseShift } from './phaseShift';

// npm t server/arena/passiveSkills/phaseShift.test.ts

describe('phaseShift', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    phaseShift.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should absorb incoming magic damage', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { magicArrow: 1 } },
      { passiveSkills: { phaseShift: 1 }, branches: ['arcana'] },
    ]);

    const [caster, defender] = game.players.players;
    const initialHp = defender.stats.val('hp');
    caster.proc = 1;
    caster.stats.set('mp', 100);
    magicArrow.cast(caster, defender, game);

    expect(defender.stats.val('hp')).toBe(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
