import { client, createRequest, createWebSocket } from '$lib/api';

export const load = async ({ depends }) => {
  depends('app:character');
  const character = await createRequest(client.character.$get)({}).catch(() => {});
  const socket = await createWebSocket();

  return {
    character,
    socket,
  };
};
