import type { CharacterPublic } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const ladderList: CharacterPublic[] = await createRequest(client.ladder.$get)({});
  return { ladderList };
};
