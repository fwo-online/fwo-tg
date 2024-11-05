import { get } from 'lodash';
import { floatNumber } from '../utils/floatNumber';
import type { ItemAttributes } from '@/schemas/item/itemAttributesSchema';

type CombineAll<T> = T extends {[name in keyof T]: infer Type} ? Type : never

type PropertyNameMap<T, IncludeIntermediate extends boolean> = {
    [name in keyof T]: T[name] extends object ? (
        SubPathsOf<name, T, IncludeIntermediate> | (IncludeIntermediate extends true ? name : never) 
    ) : name
}

type SubPathsOf<key extends keyof T, T, IncludeIntermediate extends boolean> = (
    `${string & key}.${string & PathsOf<T[key], IncludeIntermediate>}`
)

export type PathsOf<T, IncludeIntermediate extends boolean = false> = CombineAll<PropertyNameMap<T,IncludeIntermediate>>

type StatsServiceArgs = ItemAttributes;

export type Stats = StatsServiceArgs & {
  hp: number;
  mp: number;
  en: number;
  exp: number;
  // Базовая защита, до применения способностей
  defence: number;
};

type StatsPath = PathsOf<Stats>

/**
 * Класс для хранения stats
 */
export default class StatsService {
  private inRound!: Stats;
  test: ItemAttributes
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

  up(atr: StatsPath, val: number): void {
    this.inRound[atr] = floatNumber(this.inRound[atr] + val);
  }

  down(atr: StatsPath, val: number): void {
    this.inRound[atr] = floatNumber(this.inRound[atr] - val);
  }

  mul(atr: StatsPath, val: number): void {
    this.inRound[atr] = floatNumber(this.inRound[atr] * val);
    console.log('Mul:', atr, ' val:', val, 'new val:', this.inRound[atr]);
  }

  set(atr: StatsPath, val: number): void {
    this.inRound[atr] = floatNumber(val);
  }

  /**
   * Функция изменения атрибута
   * @param type тип изменения up/down
   * @param atr изменяемый атрибут atk/hark.str/def
   * @param val значение на которое будет изменено
   * изменение может происходить только внутри inRound
   * @deprecated
   */
  mode(type: 'up' | 'down' | 'set', atr: StatsPath, val: number): void {
    const oldValue = this.inRound[atr];
    
    switch (type) {
      case 'up':
        this.inRound[atr] = floatNumber(oldValue + val);
        break;
      case 'down':
        this.inRound[atr] = floatNumber(oldValue - val);
        break;
      case 'set':
        this.inRound[atr] = floatNumber(val);
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
    const oldData = structuredClone(this.inRound ?? {}); // ссылаемся на внешний объект
    if (oldData.exp) {
      this.collect.exp += oldData.exp;
    }

    // выставляем ману и хп на начало раунда
    this.inRound = {
      ...structuredClone(this.defStat),
      hp: oldData.hp ?? this.defStat.base.hp, // @todo hardcord
      mp: oldData.mp ?? this.defStat.base.mp,
      en: oldData.en ?? this.defStat.base.en,
      exp: 0, // кол-во Exp на начало раунда
      defence: this.defStat.phys.defence, // кол-во дефа на начало
      dex: oldData.attributes.dex ?? this.defStat.attributes.dex, // кол-во ловкости на начало
    };
  }

  /**
   * Функция возвращающее значение атрибута
   * @param atr str/atk/prt/dex
   */
  val<T extends PathsOf<Stats, true>>(atr: T) {
    return get(this.inRound, atr);
  }

  /**
   * Добавление голда игроку
   * @param n кол-во gold
   */
  addGold(n = 0): void {
    this.collect.gold += +n;
  }
}
