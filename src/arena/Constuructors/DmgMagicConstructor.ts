import { SuccessArgs } from '../BattleLog';
import floatNumber from '../floatNumber';
import MiscService from '../MiscService';
import Player from '../PlayerService';
import { Magic, MagicArgs } from './MagicConstructor';
import { DamageType } from './types';

export interface DmgMagicArgs extends MagicArgs {
  dmgType: DamageType;
}

export interface DmgMagic extends DmgMagicArgs, Magic {
}
/**
 * Общий конструктор не длительных магий
 */
export abstract class DmgMagic extends Magic {
  status = {
    exp: 0,
    hit: 0,
  }
  /**
   * Создание магии
   */
  constructor({ dmgType, ...magObj }: DmgMagicArgs) {
    super(magObj);
    this.dmgType = dmgType;
  }

  /**
   * Возвращает шанс прохождения магии
   */
  effectVal(): number {
    const { initiator, target } = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    let eff = MiscService.dice(this.effect[initiatorMagicLvl - 1]) * initiator.proc;
    if (this.dmgType !== 'clear') {
      // правим урон от mgp цели и mga кастера
      eff = eff * (1 + 0.004 * initiator.stats.val('mga'))
          * (1 - 0.002 * target.stats.val('mgp'));
      const resist = target.resists[this.dmgType];
      if (resist) {
        eff *= resist;
      }
    }
    this.status.hit = eff;
    return eff;
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   */
  getExp(): void {
    const { initiator, target, game } = this.params;

    if (game.isPlayersAlly(initiator, target) && !initiator.flags.isGlitched) {
      this.status.exp = 0;
    } else {
      const dmgExp = Math.round(this.status.hit * 8) + this.baseExp;
      this.status.exp = dmgExp;
      initiator.stats.mode('up', 'exp', dmgExp);
    }
  }

  /**
   * Магия прошла удачно
   * @param initiator обьект персонажаы
   * @param target обьект цели магии
   * @todo тут нужен вывод требуемых параметров
   */
  next(initiator: Player, target: Player): void {
    const { game } = this.params;
    const dmgObj: SuccessArgs = {
      exp: this.status.exp,
      dmg: floatNumber(this.status.hit),
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      hp: target.stats.val('hp'),
      initiator: initiator.nick,
      dmgType: this.dmgType,
    };
    game.addHistoryDamage(dmgObj);
    game.battleLog.success(dmgObj);
  }
}
