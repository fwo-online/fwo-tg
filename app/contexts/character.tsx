import type { Character } from '@fwo/schemas';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { createContext, use, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export type CharacterContextType = {
  character: Character | undefined;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
};

export const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: PropsWithChildren) => {
  const socket = useWebSocket();

  const [character, setCharacter] = useState(use(socket.emitWithAck('character')));

  socket.on('character', setCharacter);

  return <CharacterContext value={{ character, setCharacter }}>{children}</CharacterContext>;
};
