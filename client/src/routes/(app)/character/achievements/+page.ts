import type { AchievementPublic } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const achievements: AchievementPublic[] = await createRequest(client.achievements.$get)({});

  return {
    achievements,
  };
};
