import { settingsButton } from '@tma.js/sdk-svelte';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';

export const useSettingsButton = () => {
  function toSettings() {
    goto('/settings');
  }

  onMount(() => {
    if (!settingsButton.isSupported()) {
      return;
    }
    console.log('Mounting settings button', settingsButton.isSupported());

    settingsButton.mount();
    settingsButton.show();
    settingsButton.onClick(toSettings);

    return () => {
      settingsButton.offClick(toSettings);
      settingsButton.hide();
    };
  });
};
