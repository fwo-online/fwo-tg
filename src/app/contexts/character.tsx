import type { Character } from '@/schemas/character';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { createContext, use, useState } from 'react';

export type CharacterContextType = {
  character: Character,
  setCharacter: Dispatch<SetStateAction<Character>>
}
// @ts-expect-error fix default type
export const CharacterContext = createContext<CharacterContextType>(null);

export const CharacterProvider = (
  { children, characterPromise }: PropsWithChildren<{ characterPromise: Promise<Character | void>}>,
) => {
  const result = use(characterPromise);

  // @ts-expect-error fix void type
  const [character, setCharacter] = useState<Character>(result);

  return (
    <CharacterContext value={{ character, setCharacter }}>
      {children}
    </CharacterContext>
  );
};
