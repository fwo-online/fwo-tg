import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
  depends('app:branches-info');
  const [passiveSkills, branchesInfo] = await Promise.all([
    createRequest(client.passiveSkill.$get)({ query: { ids: [] } }),
    createRequest(client.branches.$get)({}),
  ]);

  return {
    passiveSkills,
    branchesInfo,
  };
};
