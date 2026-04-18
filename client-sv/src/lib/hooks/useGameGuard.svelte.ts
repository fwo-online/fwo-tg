import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getCharacterContext } from '$lib/constext/character';
import { onSocket } from '$lib/utils/on-socket';

export const useGameGuard = () => {
  const character = getCharacterContext();

  const navigateToGame = (gameID: string) => {
    character().game = gameID;
    goto(`/game/${gameID}`);
  };

  onSocket('game:start', navigateToGame);

  onMount(() => {
    const currentGame = character().game;
    const pathname = page.url.pathname;

    if (currentGame) {
      navigateToGame(currentGame);
      return;
    }

    if (pathname.startsWith('/game')) {
      goto('/');
    }
  });
};
