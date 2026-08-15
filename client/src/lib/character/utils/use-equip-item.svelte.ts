import type { ItemWithID } from '@fwo/shared';
import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const equipItem = createRequestRunner(async (item: ItemWithID) => {
  await createRequest(client.inventory[':id'].equip.$patch)({ param: { id: item.id } });
  await invalidate('app:character');
});

export const unEquipItem = createRequestRunner(async (item: ItemWithID) => {
  await createRequest(client.inventory[':id'].unequip.$patch)({ param: { id: item.id } });
  await invalidate('app:character');
});
