import type { CharacterPublic, Clan } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const clan = await createRequest(client.clan.$get)({});

  let players: CharacterPublic[] = [];
  let requests: CharacterPublic[] = [];

  if (clan?.players?.length) {
    players = await createRequest(client.character.list.$get)({ query: { ids: clan.players } });
  }

  if (clan?.requests?.length) {
    requests = await createRequest(client.character.list.$get)({ query: { ids: clan.requests } });
  }

  return { clan, players, requests };
};
