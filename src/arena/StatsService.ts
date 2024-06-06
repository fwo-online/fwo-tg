import _ from 'lodash';
import type { Harks } from '../data';
import { floatNumber } from '../utils/floatNumber';
import type Char from './CharacterService';

type StatsServiceArgs = Char['def'] & Harks.HarksLvl;

export type Stats = StatsServiceArgs & {
  hp: number;
  mp: number;
  en: number;
  exp: number;
  def: number;
  atk: number;
};

const isMinMax = (atr: keyof Stats): atr is 'hl' | 'hit' => atr === 'hl' || atr === 'hit';

/**
 * Класс для хранения stats
 */
export default class StatsService {
  private inRound!: Stats;
  public readonly collect = { exp: 0, gold: 0 };
  /**
   * Конструктор класса stats
   * @param defStat объект параметров
   */
  constructor(
    private defStat: StatsServiceArgs,
  ) {
    this.refresh();
  }

  private setDefaultVal(atr: keyof Stats) {
    if (typeof this.inRound[atr] === undefined && !isMinMax(atr)) {
      console.error('mode atr error', atr);
      this.inRound[atr] = 0;
    }
  }

  up(atr: keyof Stats, val: number): void {
    this.setDefaultVal(atr);
    if (isMinMax(atr)) {
      this.inRound[atr].max = floatNumber(this.inRound[atr].max + val);
    } else {
      this.inRound[atr] = floatNumber(this.inRound[atr] + val);
    }
  }

  down(atr: keyof Stats, val: number): void {
    this.setDefaultVal(atr);
    if (isMinMax(atr)) {
      this.inRound[atr].max = floatNumber(this.inRound[atr].max - val);
    } else {
      this.inRound[atr] = floatNumber(this.inRound[atr] - val);
    }
  }

  mul(atr: keyof Stats, val: number): void {
    this.setDefaultVal(atr);
    if (isMinMax(atr)) {
      this.inRound[atr].max = floatNumber(this.inRound[atr].max * val);
    } else {
      this.inRound[atr] = floatNumber(this.inRound[atr] * val);
    }
    console.log('Mul:', atr, ' val:', val, 'new val:', this.inRound[atr]);
  }

  set(atr: keyof Stats, val: number): void {
    this.setDefaultVal(atr);
    if (isMinMax(atr)) {
      this.inRound[atr].max = floatNumber(val);
    } else {
      this.inRound[atr] = floatNumber(val);
    }
  }

  /**
   * Функция изменения атрибута
   * @param type тип изменения up/down
   * @param atr изменяемый атрибут atk/hark.str/def
   * @param val значение на которое будет изменено
   * изменение может происходить только внутри inRound
   * @deprecated
   */
  mode(type: 'up' | 'down' | 'set', atr: keyof Stats, val: number): void {
    this.setDefaultVal(atr);
    let oldValue: number;
    if (isMinMax(atr)) {
      oldValue = this.inRound[atr].max;
    } else {
      oldValue = this.inRound[atr];
    }
    switch (type) {
      case 'up':
        // @ts-expect-error @deplecated
        this.inRound[atr] = floatNumber(oldValue + val);
        break;
      case 'down':
        // @ts-expect-error @deplecated
        this.inRound[atr] = floatNumber(oldValue - val);
        break;
      case 'set':
        if (atr === 'hit' || atr === 'hl') {
          // @ts-expect-error @deplecated
          oldValue = floatNumber(a * val);
          this.inRound[atr].max = oldValue;
        } else {
          oldValue = floatNumber(val);
          this.inRound[atr] = oldValue;
        }
        break;
      default:
        console.error('Stats mode type error', type);
        throw new Error('stat mode fail');
    }
    console.log('new stat:', this.inRound[atr], 'atr', atr, 'val', val);
  }

  /**
   * Функция обнуления состояние inRound Object
   */
  refresh(): void {
    const oldData = _.cloneDeep(this.inRound ?? {}); // ссылаемся на внешний объект
    if (oldData.exp) {
      this.collect.exp += oldData.exp;
    }

    // выставляем ману и хп на начало раунда
    this.inRound = {
      ..._.cloneDeep(this.defStat),
      hp: oldData.hp ?? this.defStat.maxHp, // @todo hardcord
      mp: oldData.mp ?? this.defStat.maxMp,
      en: oldData.en ?? this.defStat.maxEn,
      exp: 0, // кол-во Exp на начало раунда
      def: 0, // кол-во дефа на начало
      atk: 0,
      dex: oldData.dex ?? this.defStat.dex, // кол-во ловкости на начало
    };
  }

  /**
   * Функция возвращающее значение атрибута
   * @param atr str/atk/prt/dex
   */
  val<T extends keyof Stats>(atr: T): Stats[T] {
    const a = this.inRound[atr];
    if (typeof a === 'number') {
      return <Stats[T]>floatNumber(a);
    }
    return a;
  }

  /**
   * Добавление голда игроку
   * @param n кол-во gold
   */
  addGold(n = 0): void {
    this.collect.gold += +n;
  }
}
