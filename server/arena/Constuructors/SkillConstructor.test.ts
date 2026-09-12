import { OrderType } from '@fwo/shared';
import { beforeEach, describe, expect, it } from 'bun:test';
import type { GameService } from '@/arena';
import TestUtils from '@/utils/testUtils';
import { Skill } from './SkillConstructor';

class TestRangedSkill extends Skill {
  constructor() {
    super({
      name: 'aimedShot',
      displayName: 'Тестовый выстрел',
      desc: 'Тестовый скилл',
      cost: [10, 12, 14],
      proc: 20,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [80, 85, 90],
      effect: [1.2, 1.4, 1.6],
      profList: { l: 1 },
      bonusCost: [10, 20, 30],
      weaponTypes: ['range'],
    });
  }

  run() {
    this.status.effect = this.getEffect();
  }
}

describe('SkillConstructor', () => {
  let game: GameService;

  beforeEach(async () => {
    game = await TestUtils.createGame([{}, {}]);
  });

  it('should return effect based on character skill level with getEffect()', () => {
    const skill = new TestRangedSkill();
    const player = game.players.players[0];
    player.skills[skill.name] = 2;

    expect(skill.getEffect(player)).toBe(1.4);
  });

  it('should return chance based on character skill level with getChance()', () => {
    const skill = new TestRangedSkill();
    const player = game.players.players[0];
    player.skills[skill.name] = 3;

    expect(skill.getChance(player)).toBe(90);
  });

  it('should validate weapon with checkWeapon()', () => {
    const skill = new TestRangedSkill();
    const player = game.players.players[0];

    // default weapon in test player is not ranged
    expect(skill.checkWeapon(player)).toBe(false);
  });

  it('should record CastError NO_WEAPON on cast when weapon does not match', () => {
    const skill = new TestRangedSkill();
    const player = game.players.players[0];

    skill.cast(player, player, game);

    const roundResults = game.getRoundResults();
    const lastResult = roundResults[roundResults.length - 1];
    expect(lastResult?.reason).toBe('NO_WEAPON');
  });
});
