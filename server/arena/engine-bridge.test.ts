import { describe, expect, it } from 'bun:test';
import {
  type BattleDefs,
  type BattleState,
  type Order,
  checkPseudoChance,
  executeSingleAction,
  floatNumber,
  getEngineStatus,
  ping,
  rollDiceExpr,
  rollRndmExpr,
} from '@fwo/engine';

describe('Rust Engine NAPI Bridge', () => {
  it('should call ping and return formatted response', () => {
    const res = ping('FWO');
    expect(res).toBe('pong: FWO (from Rust engine)');
  });

  it('should round float numbers to 2 decimal places in Rust', () => {
    expect(floatNumber(10.5555)).toBe(10.56);
    expect(floatNumber(0.1 + 0.2)).toBe(0.3);
    expect(floatNumber(42)).toBe(42);
    expect(floatNumber(1.999)).toBe(2);
  });

  it('should return engine status', () => {
    const status = getEngineStatus();
    expect(status.ready).toBe(true);
    expect(status.version).toBe('0.1.0');
    expect(status.engineName).toBe('fwo-engine-rs');
  });

  it('should parse and evaluate dice expressions in Rust', () => {
    for (let i = 0; i < 20; i++) {
      const dice = rollDiceExpr('1d80+20');
      expect(dice).toBeGreaterThanOrEqual(21);
      expect(dice).toBeLessThanOrEqual(100);

      const rndm = rollRndmExpr('1d100');
      expect(rndm).toBeGreaterThanOrEqual(1);
      expect(rndm).toBeLessThanOrEqual(100);
    }
  });

  it('should calculate pseudo-random chances with streaks in Rust', () => {
    expect(checkPseudoChance(100, 0)).toBe(true);
    expect(checkPseudoChance(0, 0)).toBe(false);
    expect(checkPseudoChance(10, 50)).toBe(true);
  });

  it('should execute physical attack through Rust combat pipeline', () => {
    const defs: BattleDefs = {
      players: [
        {
          id: 0,
          nick: 'Attacker',
          clanId: 'ClanA',
          weapon: { weaponType: 'cut', minHit: 10, maxHit: 10 },
          skills: { attack: 1 },
          magics: {},
          passives: {},
          resists: {},
          baseStats: { 'phys.attack': 20 }, // +20% -> 12 damage
          maxTarget: 1,
        },
        {
          id: 1,
          nick: 'Defender',
          clanId: 'ClanB',
          weapon: { weaponType: 'cut', minHit: 5, maxHit: 5 },
          skills: {},
          magics: {},
          passives: {},
          resists: { phys: 0.1 }, // -10% resist -> 12 * 0.9 = 10.8
          baseStats: {},
          maxTarget: 1,
        },
      ],
    };

    const state: BattleState = {
      players: [
        {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          energy: 100,
          maxEnergy: 100,
          expEarned: 0,
          isAlive: true,
          failStreaks: {},
          affects: [],
        },
        {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          energy: 100,
          maxEnergy: 100,
          expEarned: 0,
          isAlive: true,
          failStreaks: {},
          affects: [],
        },
      ],
      round: 1,
      noDamageStreak: 0,
    };

    const orders: Order[] = [
      {
        initiator: 0,
        target: 1,
        action: 'attack',
        proc: 100,
      },
    ];

    const output = executeSingleAction({ defs, state, orders });

    // 10.8 damage applied to Defender
    expect(output.nextState.players[1].hp).toBe(89.2);
    // Attacker gained 10.8 * 8 = 86 exp
    expect(output.nextState.players[0].expEarned).toBe(86);
    expect(output.events.length).toBe(1);
    expect(output.events[0].eventType).toBe('damage');
    expect(output.events[0].value).toBe(10.8);
    expect(output.events[0].exp).toBe(86);
  });

  it('should handle Dodge in Rust combat pipeline without dealing damage', () => {
    const defs: BattleDefs = {
      players: [
        {
          id: 0,
          nick: 'Attacker',
          clanId: 'ClanA',
          weapon: { weaponType: 'cut', minHit: 10, maxHit: 10 },
          skills: {},
          magics: {},
          passives: {},
          resists: {},
          baseStats: {},
          maxTarget: 1,
        },
        {
          id: 1,
          nick: 'Dodger',
          clanId: 'ClanB',
          weapon: { weaponType: 'cut', minHit: 5, maxHit: 5 },
          skills: {},
          magics: {},
          passives: {},
          resists: {},
          baseStats: {},
          maxTarget: 1,
        },
      ],
    };

    const state: BattleState = {
      players: [
        {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          energy: 100,
          maxEnergy: 100,
          expEarned: 0,
          isAlive: true,
          failStreaks: {},
          affects: [],
        },
        {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          energy: 100,
          maxEnergy: 100,
          expEarned: 0,
          isAlive: true,
          failStreaks: {},
          affects: [
            {
              actionKey: 'dodge',
              initiatorId: 1,
              affectType: 'Round',
              duration: 1,
              value: 0,
              proc: 1,
            },
          ],
        },
      ],
      round: 1,
      noDamageStreak: 0,
    };

    const orders: Order[] = [
      {
        initiator: 0,
        target: 1,
        action: 'attack',
        proc: 100,
      },
    ];

    const output = executeSingleAction({ defs, state, orders });
    expect(output.nextState.players[1].hp).toBe(100); // 0 damage!
    expect(output.events.length).toBe(1);
    expect(output.events[0].eventType).toBe('dodged');
  });
});
