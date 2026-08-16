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
    const currentTower = character().tower;
    const pathname = page.url.pathname;

    if (currentTower) {
      navigateToTower(currentTower);
      return;
    }

    if (pathname.startsWith('/tower')) {
      goto('#/');
    }
  });
};
