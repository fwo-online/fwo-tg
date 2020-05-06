const _ = require('lodash');
const PlayerService = require('./PlayerService');

/**
 * Класс контроля игроков внутри созданной игры
 * @typedef {import ('./PlayerService')} Player
 */
class PlayersArr {
  /**
   * Конструктор обьекта
   * @param {String[]} arr [charId,charId,...]
   */
  constructor(arr) {
    this.init = arr;
    /** @type {Player[]} */
    this.arr = [];
  }

  /**
   * round_json
   * @description JSON пользователей нужно хратить в определенном формате
   * @return {Promise<Object<string, Player>>} userjson Обьект на начало игры
   * @todo переделать это, убрать внутрь конструктора playersArr
   */
  async roundJson() {
    const result = await Promise.all(
      this.init.map((p) => PlayerService.loading(p)),
    );
    this.arr = result;
    return _.keyBy(result, 'id');
  }

  /**
   * Функция вернет массив игроков в моей тиме
   * @param {Number|String} playerClanId идентификатор клана
   * @returns {Player[]}
   */
  getMyTeam(playerClanId) {
    if (!playerClanId) return [];
    return this.arr.filter((p) => p.clan.id === playerClanId);
  }
}

module.exports = PlayersArr;
