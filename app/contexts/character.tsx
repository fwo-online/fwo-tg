import type { Character } from '@fwo/schemas';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { createContext, useState } from 'react';
import { getCharacter } from '@/client/character';

export type CharacterContextType = {
  character: Character | undefined;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
};

export const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: PropsWithChildren) => {
  const characterPromise = getCharacter();
  const [character, setCharacter] = useState<Character | undefined>(undefined);

  characterPromise.then(() => {
    setCharacter(character);
  });

  if (!character) {
    throw characterPromise;
  }

  return <CharacterContext value={{ character, setCharacter }}>{children}</CharacterContext>;
};
