/**
 * Хил руками
 */
const HealMagicConstructor = require('../Constuructors/HealMagicConstructor');

const params = {
  desc: 'Лечение руками', lvl: 0, orderType: 'all', name: 'handsHeal',
};
const handsHeal = new HealMagicConstructor(params);

handsHeal.run = function run() {
  const { initiator, target } = this.params;
  if (Object.keys(target.flags.isHited).length) {
    throw new Error('HEAL_FAIL');
  } else {
    this.status.val = this.effectVal();
    target.flags.isHealed.push({
      initiator: initiator.id, val: this.status.val,
    });
  }
};
handsHeal.next = () => {};
module.exports = handsHeal;
