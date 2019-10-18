/**
 * Хил руками
 */
const HealMagicConstructor = require('../Constuructors/HealMagicConstructor');

const params = {
  desc: 'Лечение руками', lvl: 0, orderType: 'all', name: 'handsHeal',
};
const handsHeal = new HealMagicConstructor(params);

handsHeal.run = function run() {
  const i = this.params.initiator;
  const t = this.params.target;
  if (Object.keys(t.flags.isHited).length) {
    throw new Error({ message: 'HEAL_FAIL', action: this.name });
  } else {
    this.status.val = this.effectVal();
    t.flags.isHealed.push({
      initiator: i.id, val: this.status.val,
    });
  }
};
handsHeal.next = () => {};
module.exports = handsHeal;
