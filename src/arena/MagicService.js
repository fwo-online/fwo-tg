/**
 * Сервис работы с магиями
 */
// const magicList = arena.magics;
arena.magics = require('./magics');
_ = require('lodash');

const chance = sails.config.arena.magic.learnChance;
module.exports = {
  /**
   * Список доступных магий для профы на заданном круге
   * @param {Number} lvl круг магии
   * @param {String} prof профессия персонаже
   * @return {Object} {круг_магии:[id_магии:{описание}},...]
   */
  list: (lvl, prof) => {
    let magicList = arena.magics.filter((m) => {
      if (m.lvl === 0) return true; if (m.profList) {
        return m.profList.indexOf(prof) + 1;
      }
    });
    magicList = magicList.map((m) => ({
      name: m.name, lvl: m.lvl, orderType: m.orderType, desc: m.desc,
    }));
    magicList = _.groupBy(magicList, 'lvl');
    if (lvl === 'all') return magicList; return magicList[lvl];
  }, /**
   * Пручка магии с шансом
   * @param {Number} charId идентификатор персонажа
   * @param {Number} lvl круг проучиваемой магии
   * @return {*}
   */
  learn: (charId, lvl) => {
    const charObj = arena.players[charId];
    if (charObj.prof === 'l' || charObj.prof === 'w') {
      throw Error('no_magic_for_you');
    }
    if (lvl > charObj.lvl) {
      throw Error('circle_error');
    }
    if (lvl > charObj.bonus) {
      throw Error('bonus_error');
    }
    // массив различий
    const def = hasMagicToLearn(charId, lvl);
    if (def.length < 1) {
      throw Error('no_magic_to_learn');
    }
    if (!learnChance()) {
      throw Error('failed_learning');
    }
    // списываем бонусы
    charObj.bonus -= lvl;
    // выбираем магию
    const r = MiscService.rndm(`1d${def.length}`) - 1;
    const charMagLvl = charObj.mag[def[r]] || 0;
    charObj.learnMagic(def[r], charMagLvl + 1);
    // CharacterService.learnMagic(charId, def[r], charMagLvl + 1);
    return charObj.mag;
  }, /**
   * Показываем описание магии
   * @todo Сейчас отдаем только name и desc
   * @param {String} magId строка идентификатор магии
   * @return {*}
   */
  show: (magId) => {
    const a = arena.magics[magId];
    return { name: a.name, desc: a.desc };
  },
};

/**
 * Возвращает есть ли доступные магии на данном круге для изучения
 * @param {Number} charId идентификатор персонажа
 * @param {Number} lvl круг проучиваемой магии
 * @return {boolean}
 */
function hasMagicToLearn(charId, lvl) {
  const charObj = arena.players[charId];
  // берем массив всех магий в игре на данном уровне для этой профы
  const list = module.exports.list(lvl, charObj.prof);
  // массив всех доступных магий в игре на этом круге
  const globalList = Object.keys(_.keyBy(list, 'name'));
  // массив всех магий в круге у чара
  const charMag = Object.keys(charObj.mag);
  // разница между
  let arrayOfDiff = globalList.filter((m) => !charMag.includes(m));
  const not3lvl = charMag.filter((e) => charObj.mag[e] < 3);
  if (arrayOfDiff.length < 1) {
    // Нет новых магий в круге, проверяем а есть ли что учить
    arrayOfDiff = not3lvl;
  } else {
    arrayOfDiff = _.union(not3lvl, arrayOfDiff);
  }
  // рандомим будем ли мы учить сейчас одну из новых или проучивать старую
  return arrayOfDiff;
}

/**
 * Функция проверки шанс выучить магию
 * @return {boolean}
 */
function learnChance() {
  return chance > MiscService.rndm('1d100');
}
