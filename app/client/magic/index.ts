import { client } from '@/client';

export const getAvailableMagicList = () => {
  return client.magic.available
    .$get()
    .then((r) => r.json())
    .catch(console.log);
};

export const getMagicList = async (ids: string[]) => {
  return client.magic
    .$get({ query: { ids } })
    .then((r) => r.json())
    .catch(console.log);
};

export const getMagic = async (id: string) => {
  return client.magic[':id']
    .$get({ param: { id } })
    .then((r) => r.json())
    .catch(console.log);
};

export const learnMagic = async (lvl: number) => {
  const res = await client.magic[':lvl'].$post({ param: { lvl: lvl.toString() } });

  if (res.ok) {
    return res.json();
  }

  throw new Error(await res.text());
};
