import { BattleLog } from '@/arena/BattleLog';
import TestUtils from '@/utils/testUtils';

// npm t src/arena/BattleLog/BattleLog.test.ts

describe('BattleLog', () => {
  const battlelog = new BattleLog();

  afterEach(() => {
    battlelog.reset();
  });

  it('should format magic messages', async () => {
    battlelog.success({
      actionType: 'magic',
      action: 'Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    });

    battlelog.success({
      actionType: 'magic',
      action: 'Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
      effect: 10,
    });

    battlelog.fail({
      actionType: 'magic',
      action: 'Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'GOD_FAIL',
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should format skill messages', async () => {
    battlelog.success({
      actionType: 'skill',
      action: 'Skill',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    });

    battlelog.fail({
      actionType: 'skill',
      action: 'Skill',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'SKILL_FAIL',
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should format phys messages', async () => {
    const weapon = await TestUtils.getWeapon();

    battlelog.success({
      actionType: 'phys',
      action: 'Phys',
      initiator: 'Player 1',
      target: 'Player 2',
      weapon,
      dmgType: 'physical',
      exp: 25,
      dmg: 10,
      hp: 90,
    });

    battlelog.fail({
      actionType: 'phys',
      action: 'Phys',
      initiator: 'Player 1',
      target: 'Player 2',
      weapon,
      message: 'DEF',
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should format dmg-magic messages', async () => {
    battlelog.success({
      actionType: 'dmg-magic',
      action: 'Dmg Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'acid',
      exp: 25,
      dmg: 10,
      hp: 90,
    });

    battlelog.fail({
      actionType: 'dmg-magic',
      action: 'Phys',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'NO_MANA',
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should format heal-magic messages', async () => {
    battlelog.success({
      actionType: 'heal-magic',
      action: 'Heal Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 10,
      hp: 110,
      effect: 10,
    });

    battlelog.fail({
      actionType: 'heal-magic',
      action: 'Heal Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'SILENCED',
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should format heal messages with rigth order', async () => {
    battlelog.success({
      actionType: 'heal',
      action: 'Heal',
      initiator: 'Player 1',
      target: 'Player 2',
      expArr: [{
        id: '1', name: 'Player 1', exp: 10, val: 10,
      }],
      hp: 110,
      effect: 10,
    });

    battlelog.success({
      actionType: 'heal',
      action: 'Heal',
      initiator: 'Player 3',
      target: 'Player 2',
      expArr: [{
        id: '3', name: 'Player 3', exp: 10, val: 10,
      }],
      hp: 120,
      effect: 10,
    });

    battlelog.fail({
      actionType: 'heal',
      action: 'Heal',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'SILENCED',
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should format long magic messages with rigth order', async () => {
    battlelog.success({
      actionType: 'magic-long',
      action: 'Magic 1',
      initiator: 'Player 2',
      target: 'Player 1',
      exp: 25,
    });

    battlelog.success({
      actionType: 'magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    });

    battlelog.success({
      actionType: 'magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    });

    battlelog.success({
      actionType: 'magic-long',
      action: 'Magic 2',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    });

    battlelog.success({
      actionType: 'magic-long',
      action: 'Magic 2',
      initiator: 'Player 2',
      target: 'Player 1',
      exp: 25,
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should format long dmg magic messages with rigth order', async () => {
    battlelog.success({
      actionType: 'dmg-magic-long',
      action: 'Magic 1',
      initiator: 'Player 2',
      target: 'Player 1',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 75,
    });

    battlelog.success({
      actionType: 'dmg-magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 75,
    });

    battlelog.success({
      actionType: 'dmg-magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 50,
    });

    battlelog.success({
      actionType: 'dmg-magic-long',
      action: 'Magic 2',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 25,
    });

    battlelog.success({
      actionType: 'dmg-magic-long',
      action: 'Magic 2',
      initiator: 'Player 2',
      target: 'Player 1',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 50,
    });

    expect(battlelog.format()).toMatchSnapshot();
  });

  it('should use custom message', async () => {
    battlelog.success({
      actionType: 'skill',
      action: 'Skill',
      exp: 10,
      initiator: 'Initiator',
      target: 'Target',
      msg: (args) => `custom ${args.initiator}|${args.target}|${args.action}|${args.actionType}`,
    });

    expect(battlelog.format()).toMatchSnapshot();
  });
});
