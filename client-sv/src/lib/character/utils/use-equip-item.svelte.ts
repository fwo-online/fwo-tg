import type { Item } from '@fwo/shared';
import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { makeRequest } from '$lib/utils/make-request.svelte';

export const useEquipItem = () => {
  let isSubmitting = $state(false);

  const equipItem = async (item: Item) => {
    if (isSubmitting) {
      return;
    }
    isSubmitting = true;

    try {
      await makeRequest(() =>
        createRequest(client.inventory[':id'].equip.$patch)({ param: { id: item.id } }),
      );
      await invalidate('app:character');
    } finally {
      isSubmitting = false;
    }
  };

  const unEquipItem = async (item: Item) => {
    if (isSubmitting) {
      return;
    }
    isSubmitting = true;

    try {
      await makeRequest(() =>
        createRequest(client.inventory[':id'].unequip.$patch)({ param: { id: item.id } }),
      );
      await invalidate('app:character');
    } finally {
      isSubmitting = false;
    }
  };

  return {
    isSubmitting,
    equipItem,
    unEquipItem,
  };
};
