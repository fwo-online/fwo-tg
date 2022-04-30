import type { Clan } from '@/models/clan';

export default {
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
  clans: new Map<string, Clan>(),

  /** @type {import('telegraf').Telegraf<import('../fwo').BotContext>} */
  bot: null,
};
