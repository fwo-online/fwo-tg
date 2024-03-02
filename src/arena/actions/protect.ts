import type {
  ExpArr, OrderType, SuccessArgs, ActionType,
} from '@/arena/Constuructors/types';
import type Game from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';
import { AffectableAction } from '../Constuructors/AffectableAction';
import type { PreAffect } from '../Constuructors/interfaces/PreAffect';
import CastError from '../errors/CastError';

/**
 * Класс защиты
 */
class Protect extends AffectableAction implements PreAffect {
  name = 'protect';
  displayName = 'Защита';
  desc = 'Защита от физических атак';
  lvl = 0;
  orderType: OrderType = 'all';
  actionType: ActionType = 'protect';

  /**
   * Каст протекта
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param [game] Объект игры
   */
  cast(initiator: Player, target: Player, game: Game) {
    this.params = { initiator, target, game };
    try {
      this.checkPreAffects();
      this.run(initiator, target, game);
    } catch (e) {
      this.handleCastError(e);
    }
  }

  run(initiator: Player, target: Player, _game: Game) {
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

    const randomValue = MiscService.rndm('1d100');
    const chance = Math.round(Math.sqrt(ratio) + (10 * ratio) + 5);
    const result = chance > randomValue;
    console.log('chance', chance, 'random', randomValue, 'result', result);

    if (!result) {
      this.getExp({ initiator, target, game }, status.effect);

      throw new CastError(this.getSuccessResult({ initiator, target, game }));
    }
  }

  getExp(
    params: { initiator: Player; target: Player; game: Game; },
    expMultiplier: number,
  ) {
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
      const exp = Math.round(expMultiplier * 0.08 * protect);
      defender.stats.up('exp', exp);

      return {
        id: defender.id,
        name: defender.nick,
        exp,
      };
    });

    this.status.expArr = expArr;
  }
}

export default new Protect();
