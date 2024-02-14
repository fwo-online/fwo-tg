import type {
  BaseNext, ExpArr, OrderType, SuccessArgs,
} from '@/arena/Constuructors/types';
import type Game from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';
import type { PreAffect } from '../Constuructors/interfaces/PreAffect';
import CastError from '../errors/CastError';

export type ProtectNext = Omit<BaseNext, 'exp'> & {
  actionType: 'protect'
  expArr: ExpArr;
}

/**
 * Класс защиты
 */
class Protect implements PreAffect {
  name = 'protect';
  displayName = 'Защита';
  desc = 'Защита от физических атак';
  lvl = 0;
  orderType: OrderType = 'all';

  /**
   * Каст протекта
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param [game] Объект игры
   */
  cast(initiator: Player, target: Player, _game: Game) {
    const protectValue = initiator.stats.val('pdef') * initiator.proc;

    target.stats.up('pdef', protectValue);
    target.flags.isProtected.push({
      initiator: initiator.id, val: protectValue,
    });
  }

  preAffect(...[params, status]: Parameters<PreAffect['preAffect']>): SuccessArgs | void {
    const { initiator, target, game } = params;
    const attackValue = initiator.stats.val('patk') * initiator.proc;
    const protectValue = target.flags.isProtected.length > 0 ? target.stats.val('pdef') : 0.1;
    const ratio = floatNumber(Math.round(attackValue / protectValue));
    console.log('at', ratio);

    const randomValue = MiscService.rndm('1d100');
    const chance = 20 * ratio + 50;
    const result = chance > randomValue;
    console.log('chance', chance, 'random', randomValue, 'result', result);

    if (!result) {
      throw new CastError(this.getSuccessResult({ initiator, target, game }, status.effect));
    }
  }

  /**
   * Функция выдающая exp для каждого протектора в зависимости от его защиты
   * @todo тут скорее всего бага, которая будет давать по 5 раз всем защищающим.
   * Экспу за протект нужно выдавать в отдельном action'е который будет идти
   * за протектом
   */
  getSuccessResult(
    params: { initiator: Player; target: Player; game: Game; },
    expMultiplier: number,
  ): ProtectNext {
    const { initiator, target, game } = params;
    const pdef = target.stats.val('pdef'); // общий показатель защиты цели

    const expArr: ExpArr = target.flags.isProtected.map((flag) => {
      const defender = game.players.getById(flag.initiator) as Player;

      if (defender.id === initiator.id || !game.isPlayersAlly(defender, target)) {
        return {
          id: defender.id,
          name: defender.nick,
          exp: 0,
        };
      }

      const protect = Math.floor(flag.val * 100) / pdef;
      const exp = Math.round(expMultiplier * 0.8 * protect);
      defender.stats.up('exp', exp);

      return {
        id: defender.id,
        name: defender.nick,
        exp,
      };
    });

    return {
      expArr,
      action: this.displayName,
      actionType: 'protect',
      target: target.nick,
      initiator: initiator.nick,
    };
  }
}

export default new Protect();
