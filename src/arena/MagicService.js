const _ = require('lodash');
const { default: config } = require('./config');
const MiscService = require('./MiscService');
const { default: arena } = require('./index');

/**
 * Сервис работы с магиями
 */
// const magicList = arena.magics;

/**
 * Возвращает есть ли доступные магии на данном круге для изучения
 * @param {Number} charId идентификатор персонажа
 * @param {Number} lvl круг проучиваемой магии
 * @return {string[]}
 */
function hasMagicToLearn(charId, lvl) {
  const charObj = arena.characters[charId];
  // берем массив всех магий в игре на данном уровне для этой профы
  const list = module.exports.list(lvl, charObj.prof);
  // массив всех доступных магий в игре на этом круге
  const globalList = Object.keys(_.keyBy(list, 'name'));
  // массив всех магий в круге у чара
  const charMag = Object.keys(charObj.magics);
  // разница между
  let arrayOfDiff = globalList.filter((m) => !charMag.includes(m));
  const not3lvl = charMag.filter((e) => arena.magics[e].lvl === lvl && charObj.magics[e] < 3);
  if (arrayOfDiff.length < 1) {
    // Нет новых магий в круге, проверяем а есть ли что учить
    arrayOfDiff = not3lvl;
  } else {
    arrayOfDiff = _.union(not3lvl, arrayOfDiff);
  }
  // рандомим будем ли мы учить сейчас одну из новых или проучивать старую
  return arrayOfDiff;
}

const chance = config.magic.learnChance;

/**
 * Функция проверки шанс выучить магию
 * @return {boolean}
 */
function learnChance() {
  return chance > MiscService.rndm('1d100');
}

module.exports = {
  /**
   * Список доступных магий для профы на заданном круге
   * @param {Number|String} lvl круг магии
   * @param {String} prof профессия персонаже
   * @return {Object} {круг_магии:[id_магии:{описание}},...]
   */
  list(lvl, prof) {
    let magicList = _.filter(arena.magics, (m) => {
      if (m.lvl === 0) return true;
      if (m.profList) return m.profList.indexOf(prof) + 1;
    });
    magicList = _.map(magicList, (m) => ({
      name: m.name,
      lvl: m.lvl,
      orderType: m.orderType,
      desc: m.desc,
    }));
    magicList = _.groupBy(magicList, 'lvl');
    if (lvl === 'all') return magicList;
    return magicList[lvl];
  },
  /**
   * Пручка магии с шансом
   * @param {string} charId идентификатор персонажа
   * @param {Number} lvl круг проучиваемой магии
   */
  async learn(charId, lvl) {
    const character = arena.characters[charId];
    // списываем бонусы

    if (lvl > character.bonus) {
      throw Error('Не хватает бонусов');
    }
    // массив различий
    const def = hasMagicToLearn(charId, lvl);
    const r = MiscService.rndm(`1d${def.length}`) - 1;
    const charMagLvl = character.magics[def[r]] || 0;

    if (def.length < 1) {
      throw Error('Нет магий для изучения');
    }
    character.bonus -= lvl;
    if (!learnChance()) {
      throw Error('Не удалось вычить. Удача не на твоей стороне');
    }
    // выбираем магию
    await character.learnMagic(def[r], charMagLvl + 1);
    // CharacterService.learnMagic(charId, def[r], charMagLvl + 1);
    return character;
  },
  /**
   * Показываем описание магии
   * @todo Сейчас отдаем только name и desc
   * @param {String} magId строка идентификатор магии
   * @return {{name: string, desc: string}}
   */
  show(magId) {
    const a = arena.magics[magId];
    return { name: a.name, desc: a.desc };
  },
};
