import { client, createRequest, createWebSocket } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // const character = await createRequest(client.character.$get)({});
  // const socket = await createWebSocket();
  // return {
  //   character,
  //   socket,
  // };
};
