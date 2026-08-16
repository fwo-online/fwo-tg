import { client, createRequest } from '$lib/api';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const activateCharacter = createRequestRunner(async (id: string) => {
  await createRequest(client.character[':id'].activate.$patch)({
    param: { id },
  });
  window.location.reload();
});
