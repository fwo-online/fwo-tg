import ee from 'events';
import { ItemDocument } from '../models/item';
import { ActionType, BreaksMessage, DamageType } from './Constuructors/types';
import { weaponTypes } from './MiscService';

export type ExpArr = readonly [name: string, exp: number, heal?: number];

export type SuccessArgs = {
  expArr?: ExpArr[];
  exp: number;
  hp?: number;
  dmg?: number;
  initiator: string;
  target: string;
  action: string;
  dmgType?: DamageType;
  actionType?: ActionType;
  weapon?: ItemDocument;
  effect?: string[];
  msg?: (data: SuccessArgs) => string;
};

type FailArgs = SuccessArgs & {
  message: BreaksMessage;
}

/**
 * msg
 * @todo WIP, функция должна будет принимать как значения урона т.п так и
 * уметь работать с i18n
 * сейчас (е) не обрабатывается, нужно обрабатывать только нужный тип Error
 * если это не BattleLog выброс, его нужно прокидывать дальше вверх
 * @return {String} ({type:String,message:String})
 */
function csl(msgObj) {
  const {
    action, message, target, initiator, expArr, weapon,
  } = msgObj;

  const expString = expArr ? expArr.map(([name, exp]) => `${name}: 📖${exp}`).join(', ') : '';

  const TEXT: Record<BreaksMessage, Record<'en' | 'ru', string>> = {
    NO_MANA: {
      ru: `Не хватило маны для заклинания _${action}_`,
      en: '',
    },
    NO_ENERGY: {
      ru: `Не хватило энерги для умения _${action}_`,
      en: '',
    },
    SILENCED: {
      ru: `*${initiator}* пытался сотворить _${action}_, но попытка провалилась (безмолвие)`,
      en: '',
    },
    CHANCE_FAIL: {
      ru: `*${initiator}* пытался сотворить _${action}_, но у него не вышло`,
      en: '',
    },
    GOD_FAIL: {
      ru: `Заклинание _${action}_ *${initiator}* провалилось по воле богов `,
      en: '',
    },
    HEAL_FAIL: {
      ru: `*${initiator}* пытался _вылечить_ *${target}*, но тот был атакован`,
      en: '',
    },
    SKILL_FAIL: {
      ru: `*${initiator}* пытался использовать умение _${action}_, но у него не вышло`,
      en: '',
    },
    NO_WEAPON: {
      ru: `*${initiator}* пытался атаковать *${target}*, но у него не оказалось оружия в руках`,
      en: '',
    },
    DEF: {
      ru: `*${initiator}* атаковал *${target}* _${weapon ? weapon.case : ''}_, но тот смог защититься \\[${expString}]`,
      en: '',
    },
    DODGED: {
      ru: `*${initiator}* атаковал *${target}* _${weapon ? weapon.case : ''}_, но тот уклонился от атаки`,
      en: '',
    },
    ECLIPSE: {
      ru: `*${initiator}* попытался атаковал *${target}* но ничего не увидел во тьме`,
      en: '',
    },
    PARALYSED: {
      ru: `*${initiator}* попытался атаковал но был парализован 🗿`,
      en: '',
    },
  };
  const text = TEXT[message] || {
    ru: 'Ошибка парсинга строки магии',
  };
  // @todo сейчас battleLog на стороне клиента не понимает типы магий, и
  // просто отображает оплученную строку
  return text.ru;
}

/**
 * Класс вывода данных в battlelog
 * @todo WIP класс в стадии формирования
 * @see https://trello.com/c/qxnIM1Yq/17
 */
export default class BattleLog extends ee {
  /**
   * Функция логирует действия в console log
   * @param {Object.<string, string>} msgObj тип сообщения
   */
  log(msgObj: FailArgs): void {
    const data = csl(msgObj);
    this.write(data);
  }

  /**
   * Удачный проход action
   * @param {Object.<string, any>} msgObj тип сообщения
   */
  success(msgObj: SuccessArgs): void {
    let data = '';
    const { expArr } = msgObj;
    const expString = expArr ? expArr.map(([name, exp, val]) => `${name}: 💖${val} 📖${exp}`).join(', ') : '';
    // Если обьект содержит кастомную строку испльзуем её
    if (msgObj.msg) {
      data = msgObj.msg(msgObj);
    } else if (msgObj.dmgType && msgObj.dmgType === 'physical' && msgObj.weapon) {
      const { action } = weaponTypes[msgObj.weapon.wtype];
      data = `*${msgObj.initiator}* ${action(msgObj.target, msgObj.weapon)} и нанёс *${msgObj.dmg}* урона \\[ 💔-${msgObj.dmg}/${msgObj.hp} 📖${msgObj.exp} ]`;
    } else if (msgObj.dmgType) {
      data = `*${msgObj.initiator}* сотворил _${msgObj.action}_ на *${msgObj.target}* нанеся ${msgObj.dmg}  \\[ 💔-${msgObj.dmg}/${msgObj.hp} 📖${msgObj.exp} ]`;
    } else if (!msgObj.effect) {
      data = `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}* \\[ 📖${msgObj.exp} ]`;
    } else {
      data = `*${msgObj.initiator}* использовав _${msgObj.action}_ на *${msgObj.target}* с эффектом ${msgObj.effect} \\[ 📖${msgObj.exp} ]`;
    }
    // Выношу вниз т.к проверка связана с action
    if (msgObj.action === 'handsHeal') {
      data = `Игрок *${msgObj.target}* был вылечен 🤲 на *${msgObj.effect}* \\[ ${expString} ]`;
    }
    this.write(data);
  }

  /**
   * Функция отправки сообщений в Game
   * @param data обьект сообщения
   */
  write(data: string): void {
    this.emit('BattleLog', data);
  }
}
