import { client } from '@/client';

export const equipItem = async (id: string) => {
  const res = await client.inventory[':id'].equip.$patch({ param: { id } });

  if (res.ok) {
    return res.json();
  }

  throw new Error(await res.text());
};

export const unEquipItem = async (id: string) => {
  const res = await client.inventory[':id'].unequip.$patch({ param: { id } });

  if (res.ok) {
    return res.json();
  }

  throw new Error(await res.text());
};

export const sellItem = async (id: string) => {
  const res = await client.inventory[':id'].$delete({ param: { id } });

  if (res.ok) {
    return res.json();
  }

  throw new Error(await res.text());
};
