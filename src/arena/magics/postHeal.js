const { floatNumber } = require('../../utils/floatNumber');

/**
 * @typedef {import ('../PlayerService').default} player
 * @typedef {import ('../GameService').default} game
 */

module.exports = {
  /**
   * Функция которая раздает exp всем участникам хила таргета
   * @param {game} g Game
   */
  postEffect(g) {
    const Game = g;
    const expArr = [];

    /**
     * Раздаем exp всем участникам хила
     * @param {player} target цель на которую использовался handsHeal
     */
    function giveExpForHeal(target) {
      const healers = target.flags.isHealed;
      if (!Object.keys(healers).length) return;
      const maxHp = target.stats.val('maxHp');
      const curHp = target.stats.val('hp');
      let exp = 0;
      // Размер излечения
      let healEffect = 0;
      // healObj = {initiator: i.id, val: this.status.val,}
      let allHeal = healers.reduce((sum = 0, h) => sum + h.val, 0);
      allHeal = floatNumber(allHeal);
      const sumHeal = floatNumber(allHeal + curHp);
      if (sumHeal >= maxHp) {
        healEffect = floatNumber(maxHp - curHp);
      } else {
        healEffect = allHeal;
      }
      exp = Math.round(healEffect * 8);
      target.stats.mode('up', 'hp', healEffect);
      // функция вычисляет процент хила для  каждого из хиллеров
      healers.forEach((healObj) => {
        const healVal = healObj.val;
        const initiator = Game.getPlayerById(healObj.initiator);
        const hpProc = Math.round((healVal * 100) / allHeal);
        /* В случае если хил вышел за границу максимального HP
       Exp будет выдано только за кол-во до максимума */
        let playerExpForHeal = 0;
        if (Game.isPlayersAlly(initiator, target)) {
          playerExpForHeal = Math.round(exp * (hpProc / 100));
        }
        initiator.stats.mode('up', 'exp', playerExpForHeal);
        expArr.push([initiator.nick, playerExpForHeal, healVal]);
      });
      /** effect показывает кол-во хп на которое была выхилена цель
      * При этом expArr содержит кол-во хп на которую "мог бы похилить хилер"
      * но exp будет выдано в % от размера хила с учетом максимального хп цели
      * @type {import('../Constuructors/types').PostHealNext}
      */
      const args = {
        actionType: 'post-heal',
        action: 'handsHeal',
        target: target.nick,
        effect: healEffect,
        expArr,
      };
      Game.battleLog.success(args);
      expArr.length = 0;
    }

    Game.forAllPlayers(giveExpForHeal);
  },
};
