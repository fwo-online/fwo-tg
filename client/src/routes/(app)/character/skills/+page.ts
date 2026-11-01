import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
  depends('app:branches-info');
  const [skills, branchesInfo] = await Promise.all([
    createRequest(client.skill.available.$get)({}),
    createRequest(client.branches.$get)({}),
  ]);

  return {
    skills,
    branchesInfo,
  };
};
