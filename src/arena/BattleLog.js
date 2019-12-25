const ee = require('events');

/**
 * msg
 * @param {Object.<string, string>} msgObj тип сообщения
 * @todo WIP, функция должна будет принимать как значения урона т.п так и
 * уметь работать с i18n
 * сейчас (е) не обрабатывается, нужно обрабатывать только нужный тип Error
 * если это не BattleLog выброс, его нужно прокидывать дальше вверх
 * @return {String} ({type:String,message:String})
 */
function csl(msgObj) {
  const {
    failReason, action, message, target, initiator,
  } = msgObj;
  const TEXT = {
    NO_MANA: {
      ru: `Не хватило маны для заклинания ${action}`,
      eng: '',
    },
    SILENCED: {
      ru: `${initiator} пытался сотворить ${action}, но попытка провалилась(затыка)`,
      eng: '',
    },
    DEF: {
      ru: `${initiator} атаковал ${target}, но тот смог защититься [${failReason}]`,
      eng: '',
    },
    CHANCE_FAIL: {
      ru: `${initiator} пытался сотворить ${action}, но у него не вышло`,
      eng: '',
    },
    GOD_FAIL: {
      ru: `Заклинание ${action} ${initiator} провалилось по воле богов `,
      eng: '',
    },
    HEAL_FAIL: {
      ru: `${initiator} пытался вылечить ${target}, но тот был атакован`,
      eng: '',
    },
    SKILL_FAIL: {
      ru: `${initiator} пытался использовать умение ${action}, но у него не вышло`,
      eng: '',
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
   * @param {Object} msgObj тип сообщения
   */
  success(msgObj) {
    let data = '';
    // Если обьект содержит кастомную строку испльзуем её
    if (msgObj.msg) {
      data = msgObj.msg(msgObj.initiator, msgObj.exp);
    } else if (msgObj.dmgType) {
      // магия является атакующей
      data = `${msgObj.initiator} сотворил ${msgObj.action} (${msgObj.actionType}) на ${msgObj.target} нанеся ${msgObj.dmg} урона и получил +e:${msgObj.exp}`;
    } else if (!msgObj.effect) {
      data = `${msgObj.initiator} использовал ${msgObj.action} (${msgObj.actionType}) на ${msgObj.target} и получил +e:${msgObj.exp}`;
    } else {
      data = `${msgObj.initiator} использовав ${msgObj.action} на ${msgObj.target} с эффектом ${msgObj.effect} получил +e:${msgObj.exp}`;
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
