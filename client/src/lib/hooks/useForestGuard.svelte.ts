import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getCharacterContext } from '$lib/constext/character';
import { onSocket } from '$lib/utils/on-socket';

export const useForestGuard = () => {
  const character = getCharacterContext();

  const navigateToForest = (forestID: string) => {
    character().forest = forestID;
    goto(`#/forest/${forestID}`);
  };

  onSocket('game:start', navigateToForest);

  onMount(() => {
    const currentForest = character().forest;
    const pathname = page.url.pathname;

    if (currentForest) {
      navigateToForest(currentForest);
      return;
    }

    if (pathname.startsWith('/forest')) {
      goto('#/');
    }
  });
};
