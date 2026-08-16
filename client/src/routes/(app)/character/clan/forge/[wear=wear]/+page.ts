import { error } from '@sveltejs/kit';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const items = await createRequest(client.shop.$get)({ query: { wear: params.wear } });

  if (items) {
    return { items, wear: params.wear };
  }

  error(404, 'Not found');
};
