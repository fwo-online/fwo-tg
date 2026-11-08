import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
  depends('app:branches-info');
  return { tree: await createRequest(client.branches.tree.$get)({}) };
};
