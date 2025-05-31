import { useMountEffect } from '@/hooks/useMountEffect';
import { usePopup } from '@/hooks/usePopup';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useUnmountEffect } from '@/hooks/useUnmountEffect';
import { useCharacter } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import type { CharacterPublic } from '@fwo/shared';
import { useState } from 'react';

export const useLobby = () => {
  const socket = useSocket();
  const popup = usePopup();
  const characterID = useCharacter((character) => character.id);

  const [searchers, setSearchers] = useState<CharacterPublic[]>([]);

  const isSearching = searchers.some(({ id }) => id === characterID);

  useSocketListener('lobby:list', setSearchers);

  useMountEffect(() => {
    socket.emitWithAck('lobby:enter').then(setSearchers);
  });

  useUnmountEffect(() => {
    socket.emit('lobby:leave');
  });

  const toggleSearch = async () => {
    if (isSearching) {
      socket.emit('lobby:stop');
    } else {
      const res = await socket.emitWithAck('lobby:start');
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
