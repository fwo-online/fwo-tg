import type { Character } from '@fwo/shared';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { createContext, use, useState } from 'react';

export type CharacterContextType = {
  character: Character | undefined;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
};

export const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({
  children,
  ...props
}: PropsWithChildren<{ character: Promise<Character | undefined> }>) => {
  const [character, setCharacter] = useState(use(props.character) ?? undefined);

  return <CharacterContext value={{ character, setCharacter }}>{children}</CharacterContext>;
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
