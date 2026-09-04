import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { attack } from '@/arena/actions';
import { fireBall } from '@/arena/magics';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { ignition } from './ignition';

// npm t server/arena/passiveSkills/ignition.test.ts

describe('ignition', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    ignition.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply burning DoT on weapon attack', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { ignition: 1 }, branches: ['elements'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    attack.cast(p1, p2, game);

    const effects = p2.affects.getEffectsByAction('burning');
    expect(effects.length).toBeGreaterThanOrEqual(1);

    p2.affects.onCast(game, 'burning');
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should apply burning DoT on fire spell', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { fireBall: 1 }, passiveSkills: { ignition: 1 }, branches: ['elements'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('mp', 100);
    fireBall.cast(p1, p2, game);

    const effects = p2.affects.getEffectsByAction('burning');
    expect(effects.length).toBeGreaterThanOrEqual(1);

    p2.affects.onCast(game, 'burning');
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
