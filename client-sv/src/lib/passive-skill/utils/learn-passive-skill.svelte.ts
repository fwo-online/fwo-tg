import type { PassiveSkill } from '@fwo/shared';
import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const learnPassiveSkill = createRequestRunner(async (passiveSkill: PassiveSkill) => {
  await createRequest(client.passiveSkill[':id'].$post)({
    param: { id: passiveSkill.name },
  });

  invalidate('app:character');
});
