import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [magics, availableMagicLevels, branchesInfo] = await Promise.all([
    createRequest(client.magic.$get)({ query: {} }),
    createRequest(client.magic.available.$get)({}),
    createRequest(client.magic.branches.$get)({}),
  ]);

  const branchMagicsEntries = await Promise.all(
    branchesInfo.branches.map(async (b) => {
      const spells = await createRequest(client.magic.branch[':branchId'].$get)({
        param: { branchId: b.id },
      });
      return [b.id, spells] as const;
    }),
  );

  const branchMagics = Object.fromEntries(branchMagicsEntries);

  return { magics, availableMagicLevels, branchesInfo, branchMagics };
};
