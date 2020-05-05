/**
 * Хил руками
 */
const HealMagicConstructor = require('../Constuructors/HealMagicConstructor');

const params = {
  name: 'handsHeal',
  desc: 'Лечение руками. Действие может быть прервано физической атакой',
  displayName: 'Лечение руками',
  lvl: 0,
  orderType: 'all',
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
