import { client } from '@/client';

export const getAvailableSkillList = () => {
  return client.skill.available.$get().then((r) => r.json());
};

export const getSkillsList = async (ids: string[]) => {
  return client.skill.$get({ query: { ids } }).then((r) => r.json());
};

export const getSkill = async (id: string) => {
  return client.skill[':id']
    .$get({ param: { id } })
    .then((r) => r.json())
    .catch(console.log);
};

export const learnSkill = async (id: string) => {
  const res = await client.skill[':id'].$post({ param: { id } });
  if (res.ok) {
    return res.json();
  }

  throw new Error(await res.text());
};
