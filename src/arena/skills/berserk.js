const Skill = require('../Constuructors/SkillConstructor');
/**
 * Берсерк
 */

/** @typedef {import ('../PlayerService')} player */

const berserk = new Skill({
  name: 'berserk',
  displayName: '👹 Берсерк',
  desc: 'Повышает урон, но понижает магзащиту и атаку',
  cost: [8, 9, 10, 11, 12, 13],
  proc: 10,
  baseExp: 8,
  costType: 'en',
  lvl: 1,
  orderType: 'self',
  aoeType: 'target',
  chance: [70, 75, 80, 85, 90, 95],
  effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
  msg: (nick, exp) => `${nick} использовал [berserk] [📖 +${exp}]`,
  profList: ['w'],
  bonusCost: [10, 20, 30, 40, 60, 80],
});
/**
 * Логика работы скила
 * @param {player} [initiator] Обьект кастера
 */
berserk.run = function run(initiator = this.params.initiator) {
  const initiatorMagicLvl = initiator.skills[this.name];
  const effect = this.effect[initiatorMagicLvl - 1] || 1;
  const atk = initiator.stats.val('patk');
  const mgp = initiator.stats.val('mgp');
  // изменяем
  initiator.stats.mode('set', 'hit', effect);
  initiator.stats.mode('set', 'patk', atk * (1 / effect));
  initiator.stats.mode('set', 'mgp', mgp * (1 / effect));
};
module.exports = berserk;
