import type { Character } from './characterSchema';

export type CharacterPublic = Pick<
  Character,
  | 'id'
  | 'name'
  | 'lvl'
  | 'class'
  | 'secondProf'
  | 'branches'
  | 'clan'
  | 'psr'
  | 'statistics'
  | 'activeTitle'
>;
