import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { engine } from '@/arena/EngineService';
import type GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import { concussion } from './concussion';

describe('concussion', () => {
  let game: GameService;
  let basePhys: number;
  let baseMagic: number;

  beforeEach(async () => {
    game = await TestUtils.createGame([{ weapon: { type: 'stun' } }, { weapon: { type: 'stun' } }]);
    const [, target] = game.players.players;
    for (const player of game.players.players) {
      player.affects.filterAffects(() => false);
      player.stats.set('hp', 100);
    }
    basePhys = target.stats.val('phys.attack');
    baseMagic = target.stats.val('magic.attack');
    target.stats.set('phys.attack', 100);
    target.stats.set('magic.attack', 100);
    TestUtils.mockRandom();
  });

  afterEach(() => TestUtils.restoreRandom());

  function nextRound() {
    game.round.count++;
    game.players.reset();
    game.orders.reset();
  }

  function affectedPlayerAttacks() {
    const [source, target] = game.players.players;
    target.stats.set('hit.physical.min', 10);
    target.stats.set('hit.physical.max', 10);
    game.orders.ordersList.push({
      id: 'concussion-attack',
      action: 'attack',
      initiator: target.id,
      target: source.id,
      proc: 100,
    });
    expect(engine(game)).toBe(game);
  }

  it('reduces both attacks for two rounds and then restores them', () => {
    const [initiator, target] = game.players.players;
    concussion.cast(initiator, target, game, 10);

    target.affects.addLongEffect({
      action: concussion.name,
      initiator,
      value: 10,
      duration: 2,
      onCast: (game, affect) => {
        concussion.cast(initiator, target, game, affect.value);
      },
    });
    expect(target.stats.val('phys.attack')).toBe(90);
    expect(target.stats.val('magic.attack')).toBe(90);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    nextRound();
    affectedPlayerAttacks();
    expect(target.stats.val('phys.attack')).toBeCloseTo(basePhys * 0.9, 2);
    expect(target.stats.val('magic.attack')).toBeCloseTo(baseMagic * 0.9, 2);
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(1);
    expect(target.affects.getEffectsByAction('concussion')[0]).toMatchObject({
      type: 'long-effect',
      duration: 1,
    });
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    nextRound();
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(0);
    expect(target.stats.val('phys.attack')).toBe(basePhys);
    expect(target.stats.val('magic.attack')).toBe(baseMagic);
  });

  it('allows repeated applications with separate long effects and clears both after two rounds', () => {
    const [initiator, target] = game.players.players;
    concussion.cast(initiator, target, game, 10);
    target.affects.addLongEffect({
      action: concussion.name,
      initiator,
      value: 10,
      duration: 2,
      onCast: (game, affect) => {
        concussion.cast(initiator, target, game, affect.value);
      },
    });
    expect(target.stats.val('phys.attack')).toBe(90);
    concussion.cast(initiator, target, game, 10);
    target.affects.addLongEffect({
      action: concussion.name,
      initiator,
      value: 10,
      duration: 2,
      onCast: (game, affect) => {
        concussion.cast(initiator, target, game, affect.value);
      },
    });
    expect(target.stats.val('phys.attack')).toBe(81);
    expect(target.stats.val('magic.attack')).toBe(81);

    nextRound();
    affectedPlayerAttacks();
    expect(target.stats.val('phys.attack')).toBeCloseTo(basePhys * 0.81, 2);
    expect(target.stats.val('magic.attack')).toBeCloseTo(baseMagic * 0.81, 2);
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(2);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    nextRound();
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(0);
    expect(target.stats.val('phys.attack')).toBe(basePhys);
    expect(target.stats.val('magic.attack')).toBe(baseMagic);
  });
});
