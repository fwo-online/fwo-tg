import { useMountEffect } from '@/hooks/useMountEffect';
import { usePopup } from '@/hooks/usePopup';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useUnmountEffect } from '@/hooks/useUnmountEffect';
import { useCharacter } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import type { CharacterPublic, GameType } from '@fwo/shared';
import { useCallback, useState } from 'react';

export const useLobbyQueue = (queue: GameType) => {
  const socket = useSocket();
  const popup = usePopup();
  const characterID = useCharacter((character) => character.id);

  const [searchers, setSearchers] = useState<CharacterPublic[]>([]);

  const isSearching = searchers.some(({ id }) => id === characterID);

  const handleLobbyList = useCallback(
    (characters: Record<GameType, CharacterPublic[]>) => {
      setSearchers(characters[queue]);
    },
    [queue],
  );

  useSocketListener('lobby:list', handleLobbyList);

  useMountEffect(() => {
    socket.emitWithAck('lobby:enter').then(handleLobbyList);
  });

  useUnmountEffect(() => {
    socket.emit('lobby:leave');
  });

  const toggleSearch = async () => {
    if (isSearching) {
      socket.emit('lobby:stop');
    } else {
      const res = await socket.emitWithAck('lobby:start', queue);
      if (res.error) {
        popup.info({ message: res.message });
      }
    }
  };

  return {
    toggleSearch,
    isSearching,
    searchers,
  };
};
