import type { Skill } from '@fwo/shared';
import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const learnSkill = createRequestRunner(async (skill: Skill) => {
  await createRequest(client.skill[':id'].$post)({
    param: { id: skill.name },
  });

  await invalidate('app:character');
});
