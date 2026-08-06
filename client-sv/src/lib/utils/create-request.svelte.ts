import { makeRequest } from '$lib/utils/make-request.svelte';

export const createRequest = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  let pending = $state(false);

  const run = async (...args: Parameters<T>) => {
    pending = true;
    await makeRequest(() => fn(...args)).finally(() => {
      pending = false;
    });
  };

  return {
    pending,
    run,
  };
};
