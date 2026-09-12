import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { attack } from '../actions/attack';
import { piercingShot } from './piercingShot';

// npm t server/arena/skills/piercingShot.test.ts

describe('piercingShot', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { weapon: { type: 'range' }, skills: { piercingShot: 1 } },
      {},
    ]);

    TestUtils.mockRandom();
    piercingShot.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should buff next ranged attack and penetrate armor', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);
    p2.stats.set('phys.defence', 100);

    const initialHp = p2.stats.val('hp');
    piercingShot.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    expect(p2.stats.val('hp')).toBeLessThan(initialHp);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should break shieldBlock on target when piercing shot attacks', () => {
    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('en', 50);

    p2.affects.addEffect({
      action: 'shieldBlock',
      initiator: p2,
      value: 100,
    });
    expect(p2.affects.getEffectsByAction('shieldBlock').length).toBe(1);

    piercingShot.cast(p1, p1, game);
    attack.cast(p1, p2, game);

    expect(p2.affects.getEffectsByAction('shieldBlock').length).toBe(0);
  });
});
