import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { popup } from '$lib/components/Popup/popup.svelte';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const learnSpecificMagic = createRequestRunner(async (name: string) => {
  const magic = await createRequest(client.magic.learn[':name'].$post)({
    param: { name },
  });

  await invalidate('app:character');

  popup.info({
    message: `Успешно изучена магия ${magic.displayName}`,
  });

  return magic;
});
