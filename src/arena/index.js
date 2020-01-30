module.exports = {
  /** @type {import ('./MatchMakingService')} */
  mm: null,
  /** @type Object<string, import ('./CharacterService')> */
  characters: {},
  /** @type Object<string, import ('./GameService')> */
  games: {},
  /**
   * @type Object<string, import ('../models/item')>
   * @description Item from DB
   */
  items: {},

  /** @type import ('./magics')  */
  magics: null,
};
