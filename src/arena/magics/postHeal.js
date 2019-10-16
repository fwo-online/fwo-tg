module.exports = {
  /**
   * Функция которая раздает exp всем участникам хила таргета
   * @param {Object} g Game
   */
  postEffect(g) {
    const Game = g;
    let healmsg = '';
    Game.forAllPlayers(giveExpForHeal);

    /**
     * Раздаем exp всем участникам хила
     * @param {PlayerObj} target цель на которую использовался handsHeal
     */
    function giveExpForHeal(target) {
      const healers = target.flags.isHealed;
      if (_.isEmpty(healers)) return;
      const maxHp = target.stats.val('maxHp');
      const curHp = target.stats.val('hp');
      let exp = 0;
      // healObj = {initiator: i.id, val: this.status.val,}
      let allHeal = _.reduce(healers, (sum, h) => {
        sum = sum || 0;
        return sum + h.val;
      }, 0);
      allHeal = floatNumber(allHeal);
      const sumHeal = floatNumber(allHeal + curHp);
      if (sumHeal >= maxHp) {
        exp = Math.round((maxHp - curHp) * 8);
        target.stats.mode('up', 'hp', maxHp - curHp);
      } else {
        exp = Math.round(allHeal * 8);
        target.stats.mode('up', 'hp', allHeal);
      }
      _.forEach(healers, (healObj) => {
        const healVal = +healObj.val;
        const initiator = Game.getPlayerById(healObj.initiator);
        const hpProc = Math.round(healVal * 100 / allHeal);
        // В случае если хил вышел за границу максимального HP
        // Exp будет выдано только за кол-во до максимума
        const playerExpForHeal = Math.round(exp * (hpProc / 100));
        initiator.stats.mode('up', 'exp', playerExpForHeal);
        healmsg += `[${initiator.nick} +hp:${healVal}/+e:${playerExpForHeal}] `;
      });
      sails.log(`${target.nick} был вылечен на ${allHeal} | ${healmsg}`);
      Game.sendBattleLog(`${target.nick} был вылечен на ${allHeal}|${healmsg}`);
    }
  },
};
