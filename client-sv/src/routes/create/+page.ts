import { noop } from 'es-toolkit';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const characters = await createRequest(client.character.my.$get)({}).catch(noop);

  return { characters };
};
