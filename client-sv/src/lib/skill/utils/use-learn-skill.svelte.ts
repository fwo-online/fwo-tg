import type { Skill } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import { makeRequest } from '$lib/utils/make-request.svelte';

export const useLearnSkill = (skill: Skill) => {
  let isSubmitting = $state(false);

  const learnSkill = async () => {
    if (isSubmitting) {
      return;
    }

    isSubmitting = true;

    try {
      await makeRequest(() =>
        createRequest(client.skill[':id'].$post)({
          param: { id: skill.name },
        }),
      );
    } finally {
      isSubmitting = false;
    }
  };

  return {
    isSubmitting,
    learnSkill,
  };
};
