import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { createRequestRunner } from '$lib/utils/create-request.svelte';
import { makeRequest } from '$lib/utils/make-request.svelte';

export const learnMagic = createRequestRunner(async (lvl: number) =>
  makeRequest(async () => {
    const magic = await createRequest(client.magic[':lvl'].$post)({
      param: { lvl: String(lvl) },
    });
    await invalidate('app:character');

    return magic;
  }),
);
