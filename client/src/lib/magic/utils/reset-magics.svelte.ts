import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { popup } from '$lib/components/Popup/popup.svelte';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const resetMagics = createRequestRunner(async () => {
  const result = await createRequest(client.magic.reset.$post)({});

  await invalidate('app:character');

  popup.info({
    message: `Магии и ветки сброшены. Возвращено ${result.refundedBonus}💡`,
  });

  return result;
});
