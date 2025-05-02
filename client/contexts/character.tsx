import { getCharacter } from '@/api/character';
import type { Character } from '@fwo/shared';
import type { PropsWithChildren } from 'react';
import { createContext, use } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

export type CharacterContextType = {
  character: Character | undefined;
  setCharacter: KeyedMutator<Character | undefined>;
};

export const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: PropsWithChildren) => {
  const { data, mutate } = useSWR('character', getCharacter, { suspense: true });

  return (
    <CharacterContext value={{ character: data, setCharacter: mutate }}>
      {children}
    </CharacterContext>
  );
};

export const useCharacterContext = () => {
  const context = use(CharacterContext);

  if (!context) {
    throw new Error('characterContext must be within CharacterContext');
  }

  return context;
};

export const useCharacter = () => {
  const { character, setCharacter } = useCharacterContext();

  if (!character) {
    throw new Error('character must be within ProtectedRoute');
  }

  return {
    setCharacter,
    character,
  };
};
