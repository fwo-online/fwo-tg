import type { Character } from '@fwo/shared';
import { onSettled } from 'solid-js';
import { getCharacter as fetchCharacter } from '@/api/character';
import { setCharacter } from '@/modules/character/store/character';

export async function syncCharacter(newCharacter?: Character | null) {
  if (newCharacter) {
    setCharacter(newCharacter);
  }

  const character = await fetchCharacter();

  setCharacter(character ?? undefined);
}

export function clearCharacter() {
  setCharacter(undefined);
}
