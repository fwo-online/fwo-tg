import type { PassiveSkill } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const passiveSkills: PassiveSkill[] = await createRequest(client.passiveSkill.$get)({
    query: {},
  });

  return {
    passiveSkills,
  };
};
