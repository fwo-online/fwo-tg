import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { attack } from '@/arena/actions';
import { effectService } from '@/arena/EffectService';
import { engine } from '@/arena/EngineService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { PlayerWeapon } from '@/arena/PlayersService/PlayerWeapon';
import TestUtils from '@/utils/testUtils';

describe('weightyArgument', () => {
  let game: GameService;
  let roll: ReturnType<typeof spyOn<typeof MiscService, 'rndm'>>;
  let basePhys: number;
  let baseMagic: number;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { passiveSkills: { weightyArgument: 1 }, weapon: { type: 'stun' } },
      {},
    ]);
    const [, target] = game.players.players;
    for (const player of game.players.players) {
      player.affects.filterAffects((affect) => affect.action === 'weightyArgument');
    }
    basePhys = target.stats.val('phys.attack');
    baseMagic = target.stats.val('magic.attack');
    target.stats.set('hp', 100);
    target.stats.set('phys.attack', 100);
    target.stats.set('magic.attack', 100);
    TestUtils.mockRandom();
    roll = spyOn(MiscService, 'rndm').mockReturnValue(1);
  });

  afterEach(() => {
    roll.mockRestore();
    TestUtils.restoreRandom();
  });

  function attackInEngine() {
    const [initiator, target] = game.players.players;
    initiator.stats.set('hit.physical.min', 10);
    initiator.stats.set('hit.physical.max', 10);
    game.orders.ordersList.push({
      id: 'weighty-argument-attack',
      action: 'attack',
      initiator: initiator.id,
      target: target.id,
      proc: 100,
    });
    expect(engine(game)).toBe(game);
  }

  function nextRound() {
    game.players.reset();
    game.orders.reset();
    game.round.count++;
  }

  it('applies concussion with a real attack for the current and following round', () => {
    const [, target] = game.players.players;
    attackInEngine();
    expect(target.stats.val('phys.attack')).toBe(90);
    expect(target.stats.val('magic.attack')).toBe(90);
    expect(target.affects.getEffectsByAction('concussion')[0]).toMatchObject({
      type: 'long-effect',
      duration: 2,
    });
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();

    nextRound();
    expect(target.stats.val('phys.attack')).toBe(basePhys);
    expect(engine(game)).toBe(game);
    expect(target.stats.val('phys.attack')).toBeCloseTo(basePhys * 0.9, 2);
    expect(target.stats.val('magic.attack')).toBeCloseTo(baseMagic * 0.9, 2);
    expect(target.affects.getEffectsByAction('concussion')[0]).toMatchObject({ duration: 1 });
    nextRound();
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(0);
    expect(target.stats.val('phys.attack')).toBe(basePhys);
    expect(target.stats.val('magic.attack')).toBe(baseMagic);
  });

  it('applies concussion from physical raw splash with a stun weapon', () => {
    const [initiator, target] = game.players.players;
    initiator.proc = 1;
    const ctx = attack.createContext(initiator, target, game);
    ctx.status.effect = 10;
    effectService.rawDamage(ctx, attack);
    attack.calculateExp(ctx);
    attack.next(ctx);
    expect(target.stats.val('hp')).toBe(90);
    expect(target.stats.val('phys.attack')).toBe(90);
    expect(target.affects.getEffectsByAction('concussion')[0]).toMatchObject({ duration: 2 });
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('does not apply concussion when attacking with a cut weapon', async () => {
    const [initiator, target] = game.players.players;
    initiator.weapon = new PlayerWeapon(await TestUtils.getWeapon({ type: 'cut' }));
    attackInEngine();
    expect(target.stats.val('hp')).toBe(90);
    expect(target.affects.getEffectsByAction('concussion')).toHaveLength(0);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });
});
