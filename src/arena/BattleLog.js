const ee = require('events');
const { weaponTypes } = require('./MiscService');

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

  const TEXT = {
    NO_MANA: {
      ru: `Не хватило маны для заклинания _${action}_`,
      eng: '',
    },
    NO_ENERGY: {
      ru: `Не хватило энерги для умения _${action}_`,
      eng: '',
    },
    SILENCED: {
      ru: `*${initiator}* пытался сотворить _${action}_, но попытка провалилась(затыка)`,
      eng: '',
    },
    CHANCE_FAIL: {
      ru: `*${initiator}* пытался сотворить _${action}_, но у него не вышло`,
      eng: '',
    },
    GOD_FAIL: {
      ru: `Заклинание _${action}_ *${initiator}* провалилось по воле богов `,
      eng: '',
    },
    HEAL_FAIL: {
      ru: `*${initiator}* пытался _вылечить_ *${target}*, но тот был атакован`,
      eng: '',
    },
    SKILL_FAIL: {
      ru: `*${initiator}* пытался использовать умение _${action}_, но у него не вышло`,
      eng: '',
    },
    NO_WEAPON: {
      ru: `*${initiator}* пытался атаковать *${target}*, но у него не оказалось оружия в руках`,
      eng: '',
    },
    DEF: {
      ru: `*${initiator}* атаковал *${target}* _${weapon ? weapon.case : ''}_, но тот смог защититься \\[${expString}]`,
      eng: '',
    },
    DODGED: {
      ru: `*${initiator}* атаковал *${target}* _${weapon ? weapon.case : ''}_, но тот уклонился от атаки`,
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
class BattleLog extends ee {
  /**
   * Конструктор обьекта ведущего логику отдачи сообщений для пользовательского
   * BattleLog
   */
  constructor() {
    super();
    this.msgArray = [];
  }

  /**
   * Функция логирует действия в console log
   * @param {Object.<string, string>} msgObj тип сообщения
   */
  log(msgObj) {
    const data = csl(msgObj);
    this.write(data);
  }

  /**
   * Удачный проход action
   * @param {Object.<string, any>} msgObj тип сообщения
   */
  success(msgObj) {
    let data = '';
    const { expArr } = msgObj;
    const expString = expArr ? expArr.map(([name, exp, val]) => `${name}: ❤${val} 📖${exp}`).join(', ') : '';
    // Если обьект содержит кастомную строку испльзуем её
    if (msgObj.msg) {
      data = msgObj.msg(msgObj.initiator, msgObj.exp);
    } else if (msgObj.dmgType && msgObj.dmgType === 'phys') {
      const { action } = weaponTypes[msgObj.weapon.wtype];
      data = `*${msgObj.initiator}* ${action(msgObj.target, msgObj.weapon)} и нанёс *${msgObj.dmg}* урона \\[ 💔-${msgObj.dmg}/${msgObj.hp} 📖${msgObj.exp} ]`;
    } else if (msgObj.dmgType) {
      data = `*${msgObj.initiator}* сотворил _${msgObj.action}_ (${msgObj.actionType}) на *${msgObj.target}* нанеся ${msgObj.dmg}  \\[ 💔-${msgObj.dmg}/${msgObj.hp} 📖${msgObj.exp} ]`;
    } else if (!msgObj.effect) {
      data = `*${msgObj.initiator}* использовал _${msgObj.action}_ (${msgObj.actionType}) на *${msgObj.target}* и получил +e:${msgObj.exp}`;
    } else {
      data = `*${msgObj.initiator}* использовав _${msgObj.action}_ на *${msgObj.target}* с эффектом ${msgObj.effect} получил +e:${msgObj.exp}`;
    }
    // Выношу вниз т.к проверка связана с action
    if (msgObj.action === 'handsHeal') {
      data = `Игрок *${msgObj.target}* был 🤲 вылечен 🤲 на *${msgObj.effect}* \\[ ${expString}]`
    }
    this.write(data);
  }

  /**
   * Функция отправки сообщений в Game
   * @param {string} data обьект сообщения
   */
  write(data) {
    this.emit('BattleLog', data);
  }
}

module.exports = BattleLog;
