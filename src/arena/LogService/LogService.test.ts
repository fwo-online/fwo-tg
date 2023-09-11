import { LogService } from '@/arena/LogService';
import TestUtils from '@/utils/testUtils';

// npm t src/arena/BattleLog/BattleLog.test.ts

describe('BattleLog', () => {
  let messages: string[] = [];
  const writer = (data: string[]) => {
    messages = data;
  };

  const logService = new LogService(writer);

  afterEach(() => {
    messages = [];
  });

  it('should format magic messages', async () => {
    await logService.sendBattleLog([{
      actionType: 'magic',
      action: 'Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    }, {
      actionType: 'magic',
      action: 'Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
      effect: 10,
    },
    {
      actionType: 'magic',
      action: 'Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'GOD_FAIL',
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should format skill messages', async () => {
    await logService.sendBattleLog([{
      actionType: 'skill',
      action: 'Skill',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    }, {
      actionType: 'skill',
      action: 'Skill',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'SKILL_FAIL',
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should format phys messages', async () => {
    const weapon = await TestUtils.getWeapon();

    await logService.sendBattleLog([{
      actionType: 'phys',
      action: 'Phys',
      initiator: 'Player 1',
      target: 'Player 2',
      weapon,
      dmgType: 'physical',
      exp: 25,
      dmg: 10,
      hp: 90,
    }, {
      actionType: 'phys',
      action: 'Phys',
      initiator: 'Player 1',
      target: 'Player 2',
      weapon,
      message: 'DEF',
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should format dmg-magic messages', async () => {
    await logService.sendBattleLog([{
      actionType: 'dmg-magic',
      action: 'Dmg Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'acid',
      exp: 25,
      dmg: 10,
      hp: 90,
    },
    {
      actionType: 'dmg-magic',
      action: 'Phys',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'NO_MANA',
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should format heal-magic messages', async () => {
    await logService.sendBattleLog([{
      actionType: 'heal-magic',
      action: 'Heal Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 10,
      hp: 110,
      effect: 10,
    }, {
      actionType: 'heal-magic',
      action: 'Heal Magic',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'SILENCED',
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should format heal messages with rigth order', async () => {
    await logService.sendBattleLog([{
      actionType: 'heal',
      action: 'Heal',
      initiator: 'Player 1',
      target: 'Player 2',
      expArr: [{
        id: '1', name: 'Player 1', exp: 10, val: 10,
      }],
      hp: 110,
      effect: 10,
    }, {
      actionType: 'heal',
      action: 'Heal',
      initiator: 'Player 3',
      target: 'Player 2',
      expArr: [{
        id: '3', name: 'Player 3', exp: 10, val: 10,
      }],
      hp: 120,
      effect: 10,
    }, {
      actionType: 'heal',
      action: 'Heal',
      initiator: 'Player 1',
      target: 'Player 2',
      message: 'SILENCED',
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should format long magic messages with rigth order', async () => {
    await logService.sendBattleLog([{
      actionType: 'magic-long',
      action: 'Magic 1',
      initiator: 'Player 2',
      target: 'Player 1',
      exp: 25,
    }, {
      actionType: 'magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    }, {
      actionType: 'magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    }, {
      actionType: 'magic-long',
      action: 'Magic 2',
      initiator: 'Player 1',
      target: 'Player 2',
      exp: 25,
    }, {
      actionType: 'magic-long',
      action: 'Magic 2',
      initiator: 'Player 2',
      target: 'Player 1',
      exp: 25,
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should format long dmg magic messages with rigth order', async () => {
    await logService.sendBattleLog([{
      actionType: 'dmg-magic-long',
      action: 'Magic 1',
      initiator: 'Player 2',
      target: 'Player 1',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 75,
    }, {
      actionType: 'dmg-magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 75,
    }, {
      actionType: 'dmg-magic-long',
      action: 'Magic 1',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 50,
    }, {
      actionType: 'dmg-magic-long',
      action: 'Magic 2',
      initiator: 'Player 1',
      target: 'Player 2',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 25,
    }, {
      actionType: 'dmg-magic-long',
      action: 'Magic 2',
      initiator: 'Player 2',
      target: 'Player 1',
      dmgType: 'clear',
      exp: 25,
      dmg: 25,
      hp: 50,
    }]);

    expect(messages).toMatchSnapshot();
  });

  it('should use custom message', async () => {
    await logService.sendBattleLog([{
      actionType: 'skill',
      action: 'Skill',
      exp: 10,
      initiator: 'Initiator',
      target: 'Target',
      msg: (args) => `custom ${args.initiator}|${args.target}|${args.action}|${args.actionType}`,
    }]);

    expect(messages).toMatchSnapshot();
  });
});
