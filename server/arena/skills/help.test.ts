import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { type ActionType, EffectType } from '@fwo/shared';
import { attack } from '@/arena/actions';
import { effectService } from '@/arena/EffectService';
import { engine } from '@/arena/EngineService';
import type GameService from '@/arena/GameService';
import { glitch } from '@/arena/magics/glitch';
import { magicWall } from '@/arena/magics/magicWall';
import { paralysis } from '@/arena/magics/paralysis';
import { sleep } from '@/arena/magics/sleep';
import { huntersMark } from '@/arena/passiveSkills/huntersMark';
import TestUtils from '@/utils/testUtils';
import { help } from './help';
import { parry } from './parry';

describe('help', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([
      { skills: { help: 1, parry: 1 } },
      { skills: { help: 2 } },
      { weapon: {} },
      { skills: { help: 3 } },
    ]);

    TestUtils.mockRandom();
    for (const player of game.players.players) {
      player.proc = 1;
      player.stats.set('hp', 100);
      player.stats.set('en', 100);
      player.stats.set('static.defence', 0);
    }
    const enemy = game.players.players[2];
    enemy.stats.set('hit.physical.min', 10);
    enemy.stats.set('hit.physical.max', 10);
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  function damage(actionType: ActionType = 'phys', amount = 10) {
    const [, ally, enemy] = game.players.players;
    const action = attack.cloneAction();
    action.actionType = actionType;
    const ctx = action.createContext(enemy, ally, game);
    ctx.status.setEffectPart(EffectType.Physical, amount);
    effectService.damage(ctx, action);
    return ctx;
  }

  it('should intercept damage intended for ally', () => {
    const [tank, ally, enemy] = game.players.players;
    const tankExp = tank.stats.val('exp');
    const enemyExp = enemy.stats.val('exp');
    help.cast(tank, ally, game);
    attack.cast(enemy, ally, game);

    expect(ally.stats.val('hp')).toBe(100);
    expect(tank.stats.val('hp')).toBe(90);
    expect(attack.context.target).toBe(tank);
    expect(attack.context.params.target).toBe(ally);
    expect(attack.status.affects[0]).toMatchObject({
      initiator: tank,
      target: ally,
      effect: 0,
      exp: 0,
    });
    expect(tank.stats.val('exp')).toBe(tankExp + 20);
    expect(enemy.stats.val('exp')).toBe(enemyExp + 80);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should use only the rescuer resistances and post-damage hooks', () => {
    const [tank, ally] = game.players.players;
    tank.stats.set('resists.physical', 0.5);
    ally.stats.set('resists.physical', 0.1);
    const receivedByTank = spyOn(tank.affects, 'onDamageReceived');
    const receivedByAlly = spyOn(ally.affects, 'onDamageReceived');
    help.cast(tank, ally, game);
    const ctx = damage();

    expect(ctx.status.effect).toBe(5);
    expect(tank.stats.val('hp')).toBe(95);
    expect(ally.stats.val('hp')).toBe(100);
    expect(receivedByTank).toHaveBeenCalledTimes(1);
    expect(receivedByAlly).not.toHaveBeenCalled();
  });

  it('should apply huntersMark to the rescuer hit by an intercepted arrow', async () => {
    game = await TestUtils.createGame([
      { skills: { help: 1 } },
      {},
      { passiveSkills: { huntersMark: 3 }, weapon: { type: 'range' } },
    ]);
    const [tank, ally, enemy] = game.players.players;
    for (const player of game.players.players) {
      player.proc = 1;
      player.stats.set('hp', 100);
      player.stats.set('static.defence', 0);
    }
    tank.stats.set('en', 50);
    enemy.stats.set('hit.physical.min', 10);
    enemy.stats.set('hit.physical.max', 10);
    help.cast(tank, ally, game);
    attack.cast(enemy, ally, game);

    expect(tank.stats.val('hp')).toBe(90);
    expect(ally.stats.val('hp')).toBe(100);
    expect(attack.context.target).toBe(tank);
    expect(attack.context.params.target).toBe(ally);
    const marks = tank.affects.getEffectsByAction(huntersMark.name);
    expect(marks).toHaveLength(1);
    expect(marks[0].initiator).toBe(enemy);
    expect(marks[0].value).toBe(30);
    expect(ally.affects.getEffectsByAction(huntersMark.name)).toHaveLength(0);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should wake only the sleeping rescuer hit by an intercepted attack', () => {
    const [tank, ally, enemy] = game.players.players;
    help.cast(tank, ally, game);
    // Register the real sleep effect after help, so sleep does not prevent its cast.
    sleep.createContext(enemy, tank, game);
    sleep.run();
    sleep.createContext(enemy, ally, game);
    sleep.run();
    expect(tank.affects.getEffectsByAction('asleep')).toHaveLength(1);
    expect(ally.affects.getEffectsByAction('asleep')).toHaveLength(1);

    attack.cast(enemy, ally, game);

    expect(tank.stats.val('hp')).toBe(90);
    expect(ally.stats.val('hp')).toBe(100);
    expect(attack.context.target).toBe(tank);
    expect(attack.context.params.target).toBe(ally);
    expect(tank.affects.getEffectsByAction('asleep')).toHaveLength(0);
    expect(ally.affects.getEffectsByAction('asleep')).toHaveLength(1);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should run the rescuer defence, not an earlier ally defence', () => {
    const [tank, ally, enemy] = game.players.players;
    tank.skills.help = 2;
    tank.stats.set('attributes.dex', 9999);
    parry.cast(tank, tank, game);
    const allyDefence = spyOn(parry, 'onBeforeDamageRecieve');
    // An ally defence registered before help must never see the redirected attack.
    const defendAlly = () => {
      throw new Error('Ally defence must not run');
    };
    ally.affects.addEffect({
      action: 'parry',
      initiator: ally,
      onBeforeDamageRecieve: defendAlly,
    });
    help.cast(tank, ally, game);
    attack.cast(enemy, ally, game);

    expect(ally.stats.val('hp')).toBe(100);
    expect(tank.stats.val('hp')).toBe(100);
    expect(allyDefence).toHaveBeenCalledTimes(1);
    allyDefence.mockRestore();
  });

  it('should skip an old long wall on the ally and use the rescuer parry after refresh', () => {
    const [tank, ally, enemy, caster] = game.players.players;
    caster.magics.magicWall = 1;
    caster.stats.set('mp', 99);
    caster.stats.set('spellLength', 2);
    magicWall.cast(caster, ally, game);
    const [wall] = ally.affects.getEffectsByAction('magicWall');
    const wallValue = wall.value;
    ally.affects.refresh();
    expect(wall).toMatchObject({ duration: 1 });
    tank.skills.help = 2;
    tank.stats.set('attributes.dex', 9999);
    parry.cast(tank, tank, game);
    const [block] = tank.affects.getEffectsByAction('parry');
    const parryValue = block.value ?? 0;
    help.cast(tank, ally, game);
    attack.cast(enemy, ally, game);

    expect(attack.context.target).toBe(tank);
    expect(tank.stats.val('hp')).toBe(100);
    expect(ally.stats.val('hp')).toBe(100);
    expect(wall.value).toBe(wallValue);
    expect(block.value).toBeLessThan(parryValue);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should establish help before wall and same-round paralysis in an actual engine pass', () => {
    const [tank, ally, enemy, caster] = game.players.players;
    tank.skills.help = 2;
    caster.magics.magicWall = 1;
    caster.magics.paralysis = 3;
    caster.stats.set('mp', 99);
    caster.stats.set('magic.attack', 100);
    const helpAtWallStage: number[] = [];
    ally.affects.addPassive({
      action: 'magicWall',
      initiator: caster,
      onCast() {
        helpAtWallStage.push(ally.affects.getEffectsByAction('help').length);
      },
    });
    // Intentionally reversed input: config, not order insertion, controls execution.
    game.orders.ordersList = [
      { id: 'attack', action: 'attack', initiator: enemy.id, target: ally.id, proc: 100 },
      { id: 'parry', action: 'parry', initiator: tank.id, target: tank.id, proc: 100 },
      { id: 'paralysis', action: 'paralysis', initiator: caster.id, target: tank.id, proc: 100 },
      { id: 'wall', action: 'magicWall', initiator: caster.id, target: ally.id, proc: 100 },
      { id: 'help', action: 'help', initiator: tank.id, target: ally.id, proc: 100 },
    ];
    expect(engine(game)).toBe(game);

    expect(helpAtWallStage).toEqual([1]);
    expect(tank.affects.getEffectsByAction('paralysis')).toHaveLength(1);
    expect(tank.affects.getEffectsByAction('parry')).toHaveLength(0);
    expect(ally.affects.getEffectsByAction('magicWall')).toHaveLength(2);
    expect(tank.stats.val('hp')).toBe(90);
    expect(ally.stats.val('hp')).toBe(100);
    const history = TestUtils.normalizeRoundHistory(game.getRoundResults());
    expect(history.indexOf(help.displayName)).toBeLessThan(history.indexOf(paralysis.displayName));
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should preserve unrelated damage parts, experience and affects', () => {
    const [tank, ally, enemy] = game.players.players;
    help.cast(tank, ally, game);
    const ctx = attack.createContext(enemy, ally, game);
    ctx.status.setEffectPart(EffectType.Physical, 10);
    ctx.status.setEffectPart(EffectType.Fire, 5);
    ctx.status.exp = 123;
    ctx.addAffect(attack);
    effectService.damage(ctx, attack);

    expect(ctx.target).toBe(tank);
    expect(tank.stats.val('hp')).toBe(85);
    expect(ctx.status.effectParts).toEqual({ physical: 10, fire: 5 });
    expect(ctx.status.exp).toBe(123);
    expect(ctx.status.affects).toHaveLength(2);
  });

  it('should replace an existing rescue with the new caster', () => {
    const [tank, ally, , otherTank] = game.players.players;
    help.cast(tank, ally, game);
    help.cast(otherTank, ally, game);
    const effects = ally.affects.getEffectsByAction('help');
    expect(effects).toHaveLength(1);
    expect(effects[0].initiator).toBe(otherTank);
    damage();
    expect(otherTank.stats.val('hp')).toBe(90);
    expect(tank.stats.val('hp')).toBe(100);
  });

  it('should log every unlimited cycle intercept before the final parry without duplicate XP', () => {
    const [tank, ally, enemy] = game.players.players;
    const initialExp = game.players.players.map((player) => player.stats.val('exp'));
    tank.skills.help = 2;
    ally.skills.help = 2;
    ally.skills.parry = 1;
    ally.stats.set('attributes.dex', 9999);
    parry.cast(ally, ally, game);
    help.cast(tank, ally, game);
    help.cast(ally, tank, game);
    attack.cast(enemy, ally, game);

    expect(ally.affects.getEffectsByAction('help')).toHaveLength(1);
    expect(tank.affects.getEffectsByAction('help')).toHaveLength(1);
    expect(ally.stats.val('hp')).toBe(100);
    expect(tank.stats.val('hp')).toBe(100);
    expect(attack.context.target).toBe(ally);
    expect(attack.context.params.target).toBe(ally);
    expect(game.players.players.map((player) => player.stats.val('exp'))).toEqual([
      initialExp[0] + 20,
      initialExp[1] + 28,
      initialExp[2],
      initialExp[3],
    ]);
    expect(TestUtils.normalizeRoundHistory(game.getRoundResults())).toMatchSnapshot();
  });

  it('should skip intermediate parry and award only the final rescuer parry once in a chain', () => {
    const [middle, ally, enemy, last] = game.players.players;
    for (const defender of [middle, last]) {
      defender.skills.parry = 1;
      defender.stats.set('attributes.dex', 9999);
      parry.cast(defender, defender, game);
    }
    const middleBlock = middle.affects.getEffectsByAction('parry')[0];
    const lastBlock = last.affects.getEffectsByAction('parry')[0];
    const middleValue = middleBlock.value;
    const lastValue = lastBlock.value ?? 0;
    help.cast(middle, ally, game);
    help.cast(last, middle, game);
    const initialExp = game.players.players.map((player) => player.stats.val('exp'));
    attack.cast(enemy, ally, game);

    expect(attack.context.target).toBe(last);
    expect(attack.context.params.target).toBe(ally);
    expect(game.players.players.map((player) => player.stats.val('hp'))).toEqual([
      100, 100, 100, 100,
    ]);
    expect(middleBlock.value).toBe(middleValue);
    expect(lastBlock.value).toBe(lastValue - enemy.stats.val('attributes.dex'));
    expect(game.players.players.map((player) => player.stats.val('exp'))).toEqual([
      initialExp[0],
      initialExp[1],
      initialExp[2],
      initialExp[3] + 8,
    ]);
    expect(attack.status.affects.map(({ initiator }) => initiator)).toEqual([middle, last]);
  });

  it('should apply damage and posthooks only once to the final recipient of a chain', () => {
    const [middle, ally, enemy, last] = game.players.players;
    const received: string[] = [];
    const dealt: string[] = [];
    for (const target of [ally, middle, last]) {
      target.affects.addPassive({
        action: 'staticProtect',
        initiator: target,
        onDamageReceived(ctx) {
          received.push(ctx.target.id);
        },
      });
    }
    enemy.affects.addPassive({
      action: 'attack',
      initiator: enemy,
      onDamageDealt(ctx) {
        dealt.push(ctx.target.id);
      },
    });
    help.cast(middle, ally, game);
    help.cast(last, middle, game);
    const ctx = damage();

    expect(ctx.target).toBe(last);
    expect(ctx.params.target).toBe(ally);
    expect(game.players.players.map((player) => player.stats.val('hp'))).toEqual([
      100, 100, 100, 90,
    ]);
    expect(received).toEqual([last.id]);
    expect(dealt).toEqual([last.id]);
    expect(ctx.status.affects).toHaveLength(2);
  });

  it('should terminate an unlimited cycle for each hit with fresh effects and single HP/posthook application', () => {
    const [tank, ally, enemy] = game.players.players;
    const receives: string[] = [];
    const deals: string[] = [];
    const defences: string[] = [];
    help.cast(tank, ally, game);
    help.cast(ally, tank, game);
    const guards = [ally, tank].map((target) => target.affects.getEffectsByAction('help')[0]);
    ally.affects.addPassive({
      action: 'parry',
      initiator: ally,
      onBeforeDamageRecieve(ctx) {
        expect(ctx.target).toBe(ally);
        defences.push(ctx.target.id);
      },
      onDamageReceived(ctx) {
        receives.push(ctx.target.id);
      },
    });
    enemy.affects.addPassive({
      action: 'attack',
      initiator: enemy,
      onDamageDealt(ctx) {
        deals.push(ctx.target.id);
      },
    });
    // Reusing even the same context must not persist a processed set across hits.
    const action = attack.cloneAction();
    const ctx = action.createContext(enemy, ally, game);
    for (let hit = 1; hit <= 2; hit++) {
      ctx.status.setEffectPart(EffectType.Physical, 10);
      effectService.damage(ctx, action);
      expect(ctx.target).toBe(ally);
      expect(ctx.params.target).toBe(ally);
      expect(ally.stats.val('hp')).toBe(100 - hit * 10);
      expect(tank.stats.val('hp')).toBe(100);
      expect(ctx.status.affects.map(({ initiator }) => initiator)).toEqual(
        Array.from({ length: hit }, () => [tank, ally]).flat(),
      );
      expect(defences).toHaveLength(hit);
      expect(receives).toHaveLength(hit);
      expect(deals).toHaveLength(hit);
      for (const [index, target] of [ally, tank].entries()) {
        expect(target.affects.getEffectsByAction('help')[0]).toBe(guards[index]);
      }
    }
  });

  it('should run rescuer parry after a real glitch overrides the target before receive', () => {
    const [tank, ally, enemy, caster] = game.players.players;
    caster.magics.glitch = 3;
    caster.stats.set('mp', 99);
    tank.stats.set('attributes.dex', 9999);
    parry.cast(tank, tank, game);
    const block = tank.affects.getEffectsByAction('parry')[0];
    const blockValue = block.value ?? 0;
    help.cast(tank, ally, game);
    glitch.cast(caster, enemy, game);
    const initialExp = tank.stats.val('exp');
    const randomTarget = spyOn(game.players, 'getRandomAlive').mockReturnValue(ally);
    try {
      attack.cast(enemy, caster, game);
      expect(randomTarget).toHaveBeenCalledTimes(1);
      expect(attack.context.target).toBe(tank);
      expect(attack.context.params.target).toBe(caster);
      expect(block.value).toBe(blockValue - enemy.stats.val('attributes.dex'));
      expect(game.players.players.map((player) => player.stats.val('hp'))).toEqual([
        100, 100, 100, 100,
      ]);
      expect(tank.stats.val('exp')).toBe(initialExp + 8);
      expect(attack.status.affects.map(({ action }) => action)).toEqual([
        glitch.displayName,
        help.displayName,
      ]);
    } finally {
      randomTarget.mockRestore();
    }
  });

  it('should attribute lethal redirected damage to the attacker', () => {
    const [tank, ally, enemy] = game.players.players;
    tank.stats.set('hp', 5);
    help.cast(tank, ally, game);
    damage();
    expect(tank.getKiller()?.killer).toBe(enemy);
    expect(ally.getKiller()).toBeUndefined();
    expect(ally.stats.val('hp')).toBe(100);
  });

  it('should expire unlimited protection at the end of the round', () => {
    const [tank, ally] = game.players.players;
    tank.skills.help = 3;
    help.cast(tank, ally, game);
    expect(ally.affects.getEffectsByAction('help')[0].type).toBe('effect');
    ally.affects.refresh();
    expect(ally.affects.getEffectsByAction('help')).toHaveLength(0);
    damage();
    expect(ally.stats.val('hp')).toBe(90);
    expect(tank.stats.val('hp')).toBe(100);
  });

  for (const type of ['dmg-magic', 'dmg-magic-long', 'aoe-dmg-magic', 'heal', 'skill'] as const) {
    it(`should not intercept ${type}`, () => {
      const [tank, ally] = game.players.players;
      help.cast(tank, ally, game);
      const ctx = damage(type);
      expect(ctx.target).toBe(ally);
      expect(tank.stats.val('hp')).toBe(100);
    });
  }

  it('should not intercept secondary raw damage that bypasses receive hooks', () => {
    const [tank, ally, enemy] = game.players.players;
    help.cast(tank, ally, game);
    const action = attack.cloneAction();
    const ctx = action.createContext(enemy, ally, game);
    ctx.status.setEffectPart(EffectType.Physical, 10);
    effectService.rawDamage(ctx, action);

    expect(ally.stats.val('hp')).toBe(90);
    expect(tank.stats.val('hp')).toBe(100);
  });
});
