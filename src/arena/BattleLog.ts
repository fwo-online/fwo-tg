import ee from 'events';
import _ from 'lodash';
import { bold, italic } from '../utils/formatString';
import * as icons from '../utils/icons';
import { Heal, HealNext } from './Constuructors/HealMagicConstructor';
import { LongDmgMagic, LongDmgMagicNext } from './Constuructors/LongDmgMagicConstructor';
import type { Breaks, BreaksMessage, NextArgs } from './Constuructors/types';
import { weaponTypes } from './MiscService';

const MAX_MESSAGE_LENGTH = 2 ** 12;

export type SuccessArgs = NextArgs;

type FailArgs = Breaks;

type LogMessage = (SuccessArgs & { __success: true } | (FailArgs & { __success: false }));

/**
 * msg
 * @todo WIP, функция должна будет принимать как значения урона т.п так и
 * уметь работать с i18n
 * сейчас (е) не обрабатывается, нужно обрабатывать только нужный тип Error
 * если это не BattleLog выброс, его нужно прокидывать дальше вверх
 * @return {string} ({type:String,message:String})
 */
function csl(msgObj: FailArgs): string {
  const {
    action, message, target, initiator, expArr, weapon,
  } = msgObj;

  const expString = expArr ? expArr.map(({ name, exp }) => `${name}: 📖${exp}`).join(', ') : '';

  const TEXT: Record<BreaksMessage, Record<'en' | 'ru', string>> = {
    NO_TARGET: {
      ru: `Цель для заклинания ${italic(action)} игрока ${bold(initiator)} не была найдена`,
      en: '',
    },
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

const expBrackets = (str: string) => `\n\\[ ${str} ]`;

const partitionAction = (
  messages: LogMessage[],
  msgObj: LogMessage,
): [LogMessage[], LogMessage[]] => _.partition(messages, (msg) => (
  msg.__success
  && msgObj.__success
  && msg.action === msgObj.action
  && msg.actionType === msgObj.actionType
));

type BattleLogEvent = 'BattleLog';

export interface BattleLog {
  on(event: BattleLogEvent, listener: (data: string) => void): this;
  emit(event: BattleLogEvent, data: string): boolean;
}
/**
 * Класс вывода данных в battlelog
 * @todo WIP класс в стадии формирования
 * @see https://trello.com/c/qxnIM1Yq/17
 */
export class BattleLog extends ee {
  private messages: LogMessage[] = [];

  static getExpString(args: SuccessArgs): string {
    switch (args.actionType) {
      case 'dmg-magic':
      case 'dmg-magic-long': {
        const damageType = icons.damageType[args.dmgType]();
        return expBrackets(`${damageType} 💔-${args.dmg}/${args.hp} 📖${args.exp}`);
      }
      case 'heal':
      // case 'post-heal':
        return expBrackets(args.expArr.map(({ name, exp, val }) => `${name}: 💖${val} 📖${exp}`).join(', '));
      case 'phys':
        return expBrackets(`💔-${args.dmg}/${args.hp} 📖${args.exp}`);
      default:
        return expBrackets(`📖${args.exp}`);
    }
  }

  private static humanReadable(msgObj: LogMessage): string {
    if (msgObj.__success) {
      return this.humanReadableSuccess(msgObj);
    }
    return csl(msgObj);
  }

  private static humanReadableSuccess(msgObj: SuccessArgs): string {
    const expString = this.getExpString(msgObj);

    if (msgObj.msg) {
      return `${msgObj.msg(msgObj)} ${expString}`;
    }

    let data = '';

    switch (msgObj.actionType) {
      case 'heal':
        data = `Игрок *${msgObj.target}* был вылечен 🤲 на *${msgObj.effect}*`;
        break;
      case 'phys': {
        const { action } = weaponTypes[msgObj.weapon.wtype];
        data = `*${msgObj.initiator}* ${action(msgObj.target, msgObj.weapon)} и нанёс *${msgObj.dmg}* урона`;
        break;
      }
      case 'dmg-magic':
      case 'dmg-magic-long':
        data = `*${msgObj.initiator}* сотворил _${msgObj.action}_ на *${msgObj.target}* нанеся ${msgObj.dmg}`;
        break;
      case 'magic':
      // case 'heal':
        data = `*${msgObj.initiator}* использовав _${msgObj.action}_ на *${msgObj.target}* с эффектом ${msgObj.effect}`;
        break;
      default:
        data = `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}*`;
    }

    return data + expString;
  }

  /**
   * Функция логирует действия в console log
   * @param msgObj тип сообщения
   */
  log(msgObj: FailArgs): void {
    this.messages.push({ ...msgObj, __success: false });
  }

  /**
   * Удачный проход action
   * @param msgObj тип сообщения
   */
  success(msgObj: SuccessArgs): void {
    this.messages.push({ ...msgObj, __success: true });
  }

  private sumLong(): LogMessage[] {
    const messages = [...this.messages];
    messages.forEach((msgObj, i, arr) => {
      if (msgObj.__success && msgObj.actionType === 'dmg-magic-long') {
        const [
          withAction,
          withoutAction,
        ] = partitionAction(messages, msgObj) as [LongDmgMagicNext[], LogMessage[]];

        const sumMsgObj: LogMessage[] = LongDmgMagic
          .sumNextParams(withAction)
          .map((msg) => ({ ...msg, __success: true }));
        withoutAction.splice(i, 0, ...sumMsgObj);
        arr.splice(0, messages.length, ...withoutAction);
      }
    });
    return messages;
  }

  private sumHeal(): LogMessage[] {
    const messages = [...this.messages];
    messages.forEach((msgObj, i, arr) => {
      if (msgObj.__success && msgObj.actionType === 'heal') {
        const [
          withAction,
          withoutAction,
        ] = partitionAction(messages, msgObj) as [HealNext[], LogMessage[]];
        const sumMsgObj: LogMessage[] = Heal
          .sumNextParams(withAction)
          .map((msg) => ({ ...msg, __success: true }));
        withoutAction.splice(i, 0, ...sumMsgObj);
        arr.splice(0, messages.length, ...withoutAction);
      }
    });
    return messages;
  }

  getMessages(): string[] {
    let temp = '';
    const messagesByMaxLength: string[] = [];
    this.messages = this.sumLong();
    this.messages = this.sumHeal();
    this.messages.forEach((msgObj) => {
      const message = BattleLog.humanReadable(msgObj);
      if (temp.length + message.length <= MAX_MESSAGE_LENGTH) {
        temp = temp.concat('\n\n', message);
      } else {
        messagesByMaxLength.push(temp);
      }
    });
    messagesByMaxLength.push(temp);
    return messagesByMaxLength;
  }

  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Функция отправки сообщений в Game
   * @param data обьект сообщения
   */
  write(data: string): void {
    this.emit('BattleLog', data);
  }
}
