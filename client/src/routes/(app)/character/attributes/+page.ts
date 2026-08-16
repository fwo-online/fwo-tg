import { error } from '@sveltejs/kit';
import { mapValues } from 'es-toolkit';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, parent }) => {
  const { character } = await parent();

  if (!character) {
    return error(400);
  }

  depends('app:dynamic-attributes');
  const dynamicAttributes = await createRequest(client.character['dynamic-attributes'].$get)({
    query: mapValues(character?.attributes, (n) => n.toString()),
  });

  return { dynamicAttributes };
};
