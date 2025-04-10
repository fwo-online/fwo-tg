import type { CharacterPublic, CharacterClass } from '@fwo/shared';
import type { Char } from '@/models/character';
import { ClanService } from '@/arena/ClanService';
import { calculateLvl } from '@/arena/CharacterService/utils/calculateLvl';

export function toPublicObject(char: Char): CharacterPublic {
  return {
    id: char.id.toString(),
    name: char.nickname,
    class: char.prof as CharacterClass,
    psr: char.psr,
    statistics: char.statistics,
    lvl: calculateLvl(char.exp),
    clan: char.clan ? ClanService.toPublicObject(char.clan) : undefined,
  };
}
