import type { PassiveSkill } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import { makeRequest } from '$lib/utils/make-request.svelte';

export const useLearnPassiveSkill = (skill: PassiveSkill) => {
  let isSubmitting = $state(false);

  const learnPassiveSkill = async () => {
    if (isSubmitting) {
      return;
    }

    isSubmitting = true;

    try {
      await makeRequest(() =>
        createRequest(client.passiveSkill[':id'].$post)({
          param: { id: skill.name },
        }),
      );
    } finally {
      isSubmitting = false;
    }
  };

  return {
    isSubmitting,
    learnPassiveSkill,
  };
};
