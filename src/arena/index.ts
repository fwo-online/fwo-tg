import type { Telegraf } from 'telegraf';
import type { BotContext } from '@/fwo';
import type { Clan } from '@/models/clan';
import type { Item } from '@/models/item';
import type { ItemSet } from '@/models/item-set';
import type * as actions from './actions';
import type CharacterService from './CharacterService';
import type GameService from './GameService';
import type * as magics from './magics';
import type MatchMaking from './MatchMakingService';
import type * as skills from './skills';

export default {
  mm: null as unknown as typeof MatchMaking,
  characters: {} as Record<string, CharacterService>,
  games: {} as Record<string, GameService>,
  /**
   * @description Item from DB
   */
  items: {} as unknown as Record<string, Item>,
  itemSets: {} as unknown as Record<string, ItemSet>,
  magics: null as unknown as typeof magics,
  skills: null as unknown as typeof skills,
  actions: null as unknown as typeof actions,
  clans: new Map<string, Clan>(),
  bot: null as unknown as Telegraf<BotContext>,
};
