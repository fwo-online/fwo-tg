module.exports = {
  /** @type {import ('./MatchMakingService')} */
  mm: null,
  /** @type Object<string, import ('./CharacterService')> */
  characters: {},
  /** @type Object<string, import ('./GameService').default> */
  games: {},
  /**
   * @type Record<import ('../models/item').Item['code'], import ('../models/item').Item>
   * @description Item from DB
   */
  items: {},

  /** @type import ('./magics')  */
  magics: null,
  /** @type import ('./skills/') */
  skills: null,
  /** @type import ('./actions') */
  actions: null,
  /** @type {Object<string, import ('../models/clan').ClanDocument>} */
  clans: {},
};
