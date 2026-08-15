import { popup } from '@tma.js/sdk-svelte';

export const makeRequest = async <T>(fn: () => T): Promise<Awaited<T | undefined>> => {
  try {
    return await fn();
  } catch (e) {
    console.log('ERR', e);
    if (e instanceof Error) {
      popup.show({ message: e.message });
    }
  }
};
