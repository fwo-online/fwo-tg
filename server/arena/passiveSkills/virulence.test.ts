import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { attack } from '@/arena/actions';
import { acidSpittle } from '@/arena/magics';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { virulence } from './virulence';

// npm t server/arena/passiveSkills/virulence.test.ts

describe('virulence', () => {
  let game: GameService;

  beforeEach(() => {
    TestUtils.mockRandom();
    virulence.chance[0] = 100;
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  it('should apply poison DoT on weapon attack', async () => {
    game = await TestUtils.createGame([
      { weapon: {}, passiveSkills: { virulence: 1 }, branches: ['darkness'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    attack.cast(p1, p2, game);

    const effects = p2.affects.getEffectsByAction('corpsePoison');
    expect(effects.length).toBeGreaterThanOrEqual(1);

    p2.affects.onCast(game, 'corpsePoison');
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should apply poison DoT on acid spell', async () => {
    game = await TestUtils.createGame([
      { prof: CharacterClass.Mage, magics: { acidSpittle: 1 }, passiveSkills: { virulence: 1 }, branches: ['darkness'] },
      {},
    ]);

    const [p1, p2] = game.players.players;
    p1.proc = 1;
    p1.stats.set('mp', 100);
    acidSpittle.cast(p1, p2, game);

    const effects = p2.affects.getEffectsByAction('corpsePoison');
    expect(effects.length).toBeGreaterThanOrEqual(1);

    p2.affects.onCast(game, 'corpsePoison');
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
