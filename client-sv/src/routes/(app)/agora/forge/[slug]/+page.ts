import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { client, createRequest } from '$lib/api';

export const load: PageLoad = async ({ params }) => {
  const { slug } = params;

  console.log(params.slug)
  const items = await createRequest(client.shop.$get)({ query: { wear: slug } });
  
  console.log(items)
  if (items) {
    return { items };
  }
  
	error(404, 'Not found');
};