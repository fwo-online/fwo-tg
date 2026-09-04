import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getCharacterContext } from '$lib/constext/character';
import { onSocket } from '$lib/utils/on-socket';

export const useTowerGuard = () => {
  const character = getCharacterContext();

  const navigateToTower = (gameID: string) => {
    character().game = gameID;
    goto(`#/tower/${gameID}`);
  };

  onSocket('tower:start', navigateToTower);

  onMount(() => {
    const currentGame = character().game;

    if (currentGame) {
      return;
    }

    const currentTower = character().tower;
    const hash = page.url.hash;

    if (currentTower) {
      navigateToTower(currentTower);
      return;
    }

    if (hash.startsWith('#/tower')) {
      goto('#/');
    }
  });
};
