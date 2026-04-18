import type { Skill } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const skills: Skill[] = await createRequest(client.skill.available.$get)({});

  return {
    skills,
  };
};
