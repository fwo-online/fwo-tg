import type { ItemMarket } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const marketItems: ItemMarket[] = await createRequest(client.market.$get)({});
  return { marketItems };
};
