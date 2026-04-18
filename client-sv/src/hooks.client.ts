import type { ClientInit } from '@sveltejs/kit';
import { retrieveLaunchParams } from '@tma.js/sdk-svelte';
import { initTMA } from '$lib/init';

export const init: ClientInit = async () => {
  await initTMA(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);
};
