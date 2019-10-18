/**
 * Класс контроля игроков внутри созданной игры
 */
class PlayersArr {
  /**
   * Конструктор обьекта
   * @param {Array} arr [charId,charId,...]
   */
  constructor(arr) {
    this.init = arr;
    this.arr = [];
  }

  /**
   * round_json
   * @description JSON пользователей нужно хратить в определенном формате
   * @return {Object} userjson Обьект на начало игры
   * @todo переделать это, убрать внутрь конструктора playersArr
   */
  async roundJson() {
    const result = await Promise.all(this.init.map((p) => PlayerService.loading(p)));
    this.arr = result;
    return _.keyBy(result, 'id');
  }

  /**
   * Функция вернет массив игроков в моей тиме
   * @param {Number} playerClanId идентификатор клана
   * @return {Array}
   */
  getMyTeam(playerClanId) {
    return this.arr.filter((el) => el.clan === playerClanId);
  }
}
module.exports = PlayersArr;
