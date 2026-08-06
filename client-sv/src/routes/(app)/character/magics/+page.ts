import type { Magic } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [magics, availableMagicLevels] = await Promise.all([
    createRequest(client.magic.$get)({}),
    createRequest(client.magic.available.$get)({}),
  ]);

  return { magics, availableMagicLevels };
};
