import type { Character } from './characterSchema';

export type CharacterPublic = Pick<
  Character,
  'id' | 'name' | 'lvl' | 'class' | 'clan' | 'psr' | 'statistics'
>;
