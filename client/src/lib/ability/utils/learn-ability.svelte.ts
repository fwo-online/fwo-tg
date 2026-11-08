import type { Ability } from '@fwo/shared';
import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const learnAbility = createRequestRunner(async (ability: Ability) => {
  switch (ability.kind) {
    case 'magic':
      await createRequest(client.magic.learn[':name'].$post)({
        param: { name: ability.name },
      });
      break;
    case 'skill':
      await createRequest(client.skill[':id'].$post)({
        param: { id: ability.name },
      });
      break;
    case 'passive':
      await createRequest(client.passiveSkill[':id'].$post)({
        param: { id: ability.name },
      });
      break;
  }

  await invalidate('app:character');
});
