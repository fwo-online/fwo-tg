const Skill = require('../Constuructors/SkillConstructor');
/**
 * Увертка
 */

/** @typedef {import ('../PlayerService')} player */

const dodge = new Skill({
  name: 'dodge',
  desc: 'Шанс увернуться от одной или нескольких атак(только против колющего, режущего, рубящего, метательного, оглушающего оружия)',
  cost: [10, 12, 14, 16, 18, 20],
  proc: 20,
  baseExp: 50,
  costType: 'en',
  lvl: 1,
  orderType: 'self',
  aoeType: 'target',
  chance: [75, 80, 85, 90, 95, 99],
  effect: [1.2, 1.25, 1.3, 1.35, 1.4, 1.45],
  msg: (nick, exp) => `${nick} использовал [Увертка] [📖 +${exp}]`,
  profList: ['l'],
});
/**
 * Логика работы скила
 * @param {player} [initiator] Обьект кастера
 */
dodge.run = (initiator = this.params.initiator) => {
  const initiatorSkillLvl = initiator.skills[this.name];
  initiator.flags.isDodging = this.effect[initiatorSkillLvl - 1]
      * initiator.stats.val('dex');
};
module.exports = dodge;
