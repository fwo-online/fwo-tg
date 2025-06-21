import { create } from 'zustand';
import type { Character, Clan } from '@fwo/shared';

export interface CharacterState {
  character: Character | undefined;
  setCharacter: (character: Character | undefined) => void;
  setGame: (game: string | undefined) => void;
  setTower: (tower: string | undefined) => void;
  setClan: (clan: Clan) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  character: undefined,
  setCharacter: (character) => set({ character }),
  setClan: (clan) =>
    set((state) =>
      state.character ? { character: { ...state.character, clan } } : { character: undefined },
    ),
  setGame: (game) =>
    set((state) =>
      state.character ? { character: { ...state.character, game } } : { character: undefined },
    ),
  setTower: (tower) =>
    set((state) =>
      state.character ? { character: { ...state.character, tower } } : { character: undefined },
    ),
}));

export function useCharacter(): Character;
export function useCharacter<T>(selector: (c: Character) => T): T;
export function useCharacter<T>(selector?: (c: Character) => T): T | Character {
  return useCharacterStore((state) => {
    if (!state.character) {
      throw new Error('Character is not loaded');
    }

    if (selector) {
      return selector(state.character);
    }

    return state.character;
  });
}
