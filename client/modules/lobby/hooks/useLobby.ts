import { useCharacter } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import type { CharacterPublic } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';

export const useLobby = () => {
  const socket = useSocket();
  const characterID = useCharacter((character) => character.id);

  const [searchers, setSearchers] = useState<CharacterPublic[]>([]);

  const isSearching = searchers.some(({ id }) => id === characterID);

  useEffect(() => {
    socket.on('lobby:list', setSearchers);

    return () => {
      socket.off('lobby:list', setSearchers);
    };
  }, [socket]);

  useEffect(() => {
    socket.emitWithAck('lobby:enter').then(setSearchers);
    socket.on('lobby:list', setSearchers);

    return () => {
      socket.off('lobby:list', setSearchers);
      socket.emit('lobby:leave');
    };
  }, [socket.emit, socket.on, socket.emitWithAck, socket.off]);

  const toggleSearch = async () => {
    if (isSearching) {
      socket.emit('lobby:stop');
    } else {
      const res = await socket.emitWithAck('lobby:start');
      if (res.error) {
        popup.open({ message: res.message });
      }
    }
  };

  return {
    toggleSearch,
    isSearching,
    searchers,
  };
};
