import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
  depends('app:branches-info');
  const [magics, branchesInfo] = await Promise.all([
    createRequest(client.magic.$get)({ query: {} }),
    createRequest(client.magic.branches.$get)({}),
  ]);

  const branchMagicsEntries = branchesInfo.branches.map((branch) => {
    const branchMagics = magics.filter((magic) => magic.branches?.includes(branch.id));

    return [branch.id, branchMagics];
  });

  const branchMagics = Object.fromEntries(branchMagicsEntries);

  return { magics, branchesInfo, branchMagics };
};
