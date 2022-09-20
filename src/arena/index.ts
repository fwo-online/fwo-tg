import type { Telegraf } from 'telegraf';
import type { BotContext } from '@/fwo';
import type { Clan } from '@/models/clan';
import type { Item } from '@/models/item';
import type * as actions from './actions';
import type * as magics from './magics';
import type MatchMaking from './MatchMakingService';
import type * as skills from './skills';

export default {
  /** @type {import ('./MatchMakingService')} */
  mm: null as unknown as typeof MatchMaking,
  /** @type Object<string, import ('./CharacterService')> */
  characters: {},
  /** @type Object<string, import ('./GameService').default> */
  games: {},
  /**
   * @type Record<import ('../models/item').Item['code'], import ('../models/item').Item>
   * @description Item from DB
   */
  items: {} as unknown as Record<string, Item>,

  /** @type import ('./magics')  */
  magics: null as unknown as typeof magics,
  /** @type import ('./skills/') */
  skills: null as unknown as typeof skills,
  /** @type import ('./actions') */
  actions: null as unknown as typeof actions,
  clans: new Map<string, Clan>(),

  /** @type {import('telegraf').Telegraf<import('../fwo').BotContext>} */
  bot: null as unknown as Telegraf<BotContext>,
};
