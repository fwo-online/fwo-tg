import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { attack } from '@/arena/actions/attack';
import handsHeal from '@/arena/actions/handsHeal';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { fieldMedic } from './fieldMedic';

// npm t arena/passiveSkills/fieldMedic.test.ts

describe('fieldMedic', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    fieldMedic.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should prevent handsHeal interruption when attacked by enemy', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Warrior, weapon: {} },
      { prof: CharacterClass.Archer, passiveSkills: { fieldMedic: 1 } },
    ]);

    const [warrior, scout] = game.players.players;
    warrior.proc = 1;
    scout.proc = 1;
    scout.stats.set('hp', 5);

    // Warrior attacks scout (would normally interrupt handsHeal)
    attack.cast(warrior, scout, game);

    const hpAfterAttack = scout.stats.val('hp');

    // Scout casts handsHeal - with fieldMedic, it should NOT be interrupted!
    handsHeal.cast(scout, scout, game);

    // Scout's HP should be restored higher than hpAfterAttack
    expect(scout.stats.val('hp')).toBeGreaterThan(hpAfterAttack);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should increase handsHeal effect value', async () => {
    const gameNormal = await TestUtils.createGame([
      { prof: CharacterClass.Archer },
      {},
    ]);
    const pNormal = gameNormal.players.players[0];
    pNormal.proc = 1;
    pNormal.stats.set('hp', 1);
    handsHeal.cast(pNormal, pNormal, gameNormal);
    const healNormal = pNormal.stats.val('hp') - 1;

    const gameMedic = await TestUtils.createGame([
      { prof: CharacterClass.Archer, passiveSkills: { fieldMedic: 3 } },
      {},
    ]);
    const pMedic = gameMedic.players.players[0];
    pMedic.proc = 1;
    pMedic.stats.set('hp', 1);
    handsHeal.cast(pMedic, pMedic, gameMedic);
    const healMedic = pMedic.stats.val('hp') - 1;

    expect(healMedic).toBeGreaterThan(healNormal);
  });
});
