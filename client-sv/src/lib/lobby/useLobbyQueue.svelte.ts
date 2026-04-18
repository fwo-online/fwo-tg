import type { CharacterPublic, GameType } from '@fwo/shared';
import { onMount } from 'svelte';
import { getCharacterContext } from '$lib/constext/character';
import { getSocketContext } from '$lib/constext/socket';
import { onSocket } from '$lib/utils/on-socket';

export const useLobbyQueue = (queue: GameType) => {
  const socket = getSocketContext();
  const character = getCharacterContext();

  let searchers = $state<CharacterPublic[]>([]);
  const characterID = $derived(character().id);
  const isSearching = $derived(searchers.some(({ id }) => id === characterID));

  const updateSearchers = (charactersByQueue: Record<GameType, CharacterPublic[]>) => {
    searchers = charactersByQueue[queue];
  };

  onSocket('lobby:list', updateSearchers);

  onMount(() => {
    socket().emitWithAck('lobby:enter').then(updateSearchers);

    return () => {
      socket().emit('lobby:leave');
    };
  });

  const toggleSearch = async () => {
    if (isSearching) {
      socket().emit('lobby:stop');
    } else {
      const res = await socket().emitWithAck('lobby:start', queue);
      if (res.error) {
        console.error(res.message);
        // popup.info({ message: res.message });
      }
    }
  };

  return {
    toggleSearch,
    get searchers() {
      return searchers;
    },
    get isSearching() {
      return isSearching;
    },
  };
};
