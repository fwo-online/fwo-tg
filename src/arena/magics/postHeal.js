const floatNumber = require('../floatNumber');

/**
 * @typedef {import ('../PlayerService')} player
 * @typedef {import ('../GameService')} game
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
      // healObj = {initiator: i.id, val: this.status.val,}
      let allHeal = healers.reduce((sum = 0, h) => sum + h.val, 0);
      allHeal = floatNumber(allHeal);
      const sumHeal = floatNumber(allHeal + curHp);
      if (sumHeal >= maxHp) {
        exp = Math.round((maxHp - curHp) * 8);
        target.stats.mode('up', 'hp', maxHp - curHp);
      } else {
        exp = Math.round(allHeal * 8);
        target.stats.mode('up', 'hp', allHeal);
      }
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
      // @todo подумать над тем что бы организовать это место через msg(кастомную строку магии)
      Game.battleLog.success({
        action: 'handsHeal',
        target: target.nick,
        effect: allHeal,
        expArr: expArr,
      });
      expArr.length = 0;
    };

    Game.forAllPlayers(giveExpForHeal);
  },
};
