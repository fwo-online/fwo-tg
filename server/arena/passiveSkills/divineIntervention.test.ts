import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';

// npm t server/arena/passiveSkills/divineIntervention.test.ts

describe('divineIntervention', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should restore HP and prevent death on lethal event', async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { divineIntervention: 1 }, branches: ['holy'] },
      {},
    ]);

    const [defender, attacker] = game.players.players;
    defender.stats.set('hp', 0);
    defender.setKiller(attacker, 'Атака');
    defender.affects.addLongEffect({ action: 'burning', duration: 2, initiator: attacker });
    defender.affects.addLongEffect({ action: 'corpsePoison', duration: 2, initiator: attacker });
    defender.affects.addLongEffect({ action: 'bleeding', duration: 2, initiator: attacker });

    defender.affects.onCast(game, 'divineIntervention');
    expect(defender.stats.val('hp')).toBeGreaterThan(0);
    expect(defender.getKiller()).toBeUndefined();
    expect(defender.affects.getEffectsByAction('burning')).toHaveLength(0);
    expect(defender.affects.getEffectsByAction('corpsePoison')).toHaveLength(0);
    expect(defender.affects.getEffectsByAction('bleeding')).toHaveLength(0);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
