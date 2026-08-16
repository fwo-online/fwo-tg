import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { popup } from '$lib/components/Popup/popup.svelte';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const learnMagic = createRequestRunner(async (lvl: number) => {
  const magic = await createRequest(client.magic[':lvl'].$post)({
    param: { lvl: String(lvl) },
  });

  await invalidate('app:character');

  popup.info({
    message: `Успешно изучена магия ${magic.displayName}`,
  });

  return magic;
});
