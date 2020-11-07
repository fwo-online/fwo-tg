import { floatNumber } from '../../utils/floatNumber';
import type { ExpArr, BaseNext } from '../Constuructors/types';
import type Game from '../GameService';
import type Player from '../PlayerService';

export type PostHealNext = Omit<BaseNext, 'initiator' | 'exp'> & {
  actionType: 'post-heal';
  action: string;
  target: string;
  effect: number,
  expArr: ExpArr;
}

export default class PostHeal {
/**
   * Функция которая раздает exp всем участникам хила таргета
   * @param game Game
   */
  static postEffect(game: Game): void {
    const expArr: ExpArr = [];

    /**
     * Раздаем exp всем участникам хила
     * @param target цель на которую использовался handsHeal
     */
    function giveExpForHeal(target: Player) {
      const healers = target.flags.isHealed;
      if (!healers.length) return;
      const maxHp = target.stats.val('maxHp');
      const curHp = target.stats.val('hp');
      const allHeal = floatNumber(healers.reduce((sum = 0, h) => sum + h.val, 0));
      const maxHeal = floatNumber(maxHp - curHp);
      // Размер излечения
      const healEffect = Math.min(allHeal, maxHeal);

      const exp = Math.round(healEffect * 8);
      target.stats.up('hp', healEffect);
      // функция вычисляет процент хила для  каждого из хиллеров
      healers.forEach((healObj) => {
        const healVal = healObj.val;
        const initiator = game.getPlayerById(healObj.initiator);
        const hpProc = Math.round((healVal * 100) / allHeal);
        /* В случае если хил вышел за границу максимального HP
       Exp будет выдано только за кол-во до максимума */
        if (game.isPlayersAlly(initiator, target)) {
          const playerExp = Math.round(exp * (hpProc / 100));
          initiator.stats.up('exp', playerExp);
          expArr.push({
            name: initiator.nick,
            exp: playerExp,
            val: healVal,
          });
        } else {
          expArr.push({
            name: initiator.nick,
            exp: 0,
            val: healVal,
          });
        }
      });
      /** effect показывает кол-во хп на которое была выхилена цель
      * При этом expArr содержит кол-во хп на которую "мог бы похилить хилер"
      * но exp будет выдано в % от размера хила с учетом максимального хп цели
      */
      const args: PostHealNext = {
        actionType: 'post-heal',
        action: 'handsHeal',
        target: target.nick,
        effect: healEffect,
        expArr,
      };
      game.battleLog.success(args);
      expArr.length = 0;
    }

    game.forAllPlayers(giveExpForHeal);
  }
}
