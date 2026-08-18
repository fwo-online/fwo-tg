import { error } from '@sveltejs/kit';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { slug } = params;

  const items = await createRequest(client.shop.$get)({ query: { wear: slug } });

  if (items) {
    return { items, wear: slug };
  }

  error(404, 'Not found');
};
