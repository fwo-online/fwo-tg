import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { popup } from '$lib/components/Popup/popup.svelte';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const selectBranch = createRequestRunner(async (branch: string) => {
  const result = await createRequest(client.magic.branch.$post)({
    json: { branch },
  });

  await invalidate('app:character');

  popup.info({
    message: `Выбрана ветка: ${result.selectedBranch.name}`,
  });

  return result;
});
