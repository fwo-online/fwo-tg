import { makeRequest } from '$lib/utils/make-request.svelte';

export const createRequestRunner = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  let pending = $state(false);

  const run = async (...args: Parameters<T>): Promise<ReturnType<Awaited<T>>> => {
    pending = true;
    return await makeRequest(() => fn(...args)).finally(() => {
      pending = false;
    });
  };

  return {
    get pending() {
      return pending;
    },
    run,
  };
};
