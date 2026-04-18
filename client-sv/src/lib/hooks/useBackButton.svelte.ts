import { backButton } from '@tma.js/sdk-svelte';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';

export const useBackButton = () => {
  function handleBack() {
    if (history.length > 1) {
      history.back();
    } else {
      goto('/');
    }
  }

  onMount(() => {
    if (!backButton.isSupported()) {
      return;
    }

    backButton.show();
    backButton.onClick(handleBack);

    return () => {
      backButton.offClick(handleBack);
      backButton.hide();
    };
  });
};
