import type { Clan } from '@/models/clan';
import type { ItemOutput } from '@fwo/shared';
import type { ItemSet } from '@fwo/shared';
import type { CharacterService } from './CharacterService';
import type GameService from './GameService';
import type MatchMaking from './MatchMakingService';
import type * as actions from './actions';
import type * as magics from './magics';
import type * as passiveSkills from './passiveSkills';
import type * as skills from './skills';
import type * as weaponMastery from './weaponMastery';

export default {
  mm: null as unknown as typeof MatchMaking,
  characters: {} as Record<string, CharacterService>,
  games: {} as Partial<Record<string, GameService>>,
  items: {} as unknown as Record<string, ItemOutput>,
  itemsSets: {} as unknown as Record<string, ItemSet>,
  magics: {} as unknown as typeof magics,
  skills: {} as unknown as typeof skills,
  actions: {} as unknown as typeof actions &
    typeof magics &
    typeof skills &
    typeof passiveSkills &
    typeof weaponMastery,
  clans: new Map<string, Clan>(),
};
