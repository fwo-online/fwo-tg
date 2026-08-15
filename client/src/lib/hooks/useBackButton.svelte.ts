import { backButton } from '@tma.js/sdk-svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';

const rootPaths = ['/', '/character', '/lobby', '/agora'];

export const useBackButton = () => {
  function handleBack() {
    if (history.length > 1) {
      history.back();
    } else {
      const parts = page.url.pathname.split('/').filter(Boolean);
      if (parts.length > 1) {
        goto(`/${parts[0]}`);
      } else {
        goto('/character');
      }
    }
  }

  $effect(() => {
    if (!backButton.isSupported()) {
      return;
    }

    if (!backButton.isMounted()) {
      backButton.mount();
    }

    const isRoot = rootPaths.includes(page.url.pathname);

    if (isRoot) {
      backButton.hide();
    } else {
      backButton.show();
    }

    backButton.onClick(handleBack);

    return () => {
      backButton.offClick(handleBack);
    };
  });
};
