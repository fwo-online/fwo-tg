import type { Character } from '@fwo/schemas';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { createContext, use, useCallback, useState } from 'react';

export type CharacterContextType = {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  resetCharacter: () => void;
};
// @ts-expect-error fix default type
export const CharacterContext = createContext<CharacterContextType>(null);

export const CharacterProvider = ({
  children,
  characterPromise,
}: PropsWithChildren<{ characterPromise: Promise<Character | void> }>) => {
  const result = use(characterPromise);

  // @ts-expect-error fix void type
  const [character, setCharacter] = useState<Character>(result);

  const resetCharacter = useCallback(() => {
    // @ts-expect-error fix void type
    setCharacter(undefined);
  }, []);

  return (
    <CharacterContext value={{ character, setCharacter, resetCharacter }}>
      {children}
    </CharacterContext>
  );
};
