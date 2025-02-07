import type { Character } from './characterSchema';

export type CharacterPublic = Pick<Character, 'name' | 'lvl' | 'class'>;
