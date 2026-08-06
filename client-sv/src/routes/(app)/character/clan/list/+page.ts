import type { Clan } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const clans: Clan[] = await createRequest(client.clan.list.$get)({});
  return { clans };
};
