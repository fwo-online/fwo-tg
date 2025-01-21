import { client } from '@/client';
import type { CharacterAttributes, CreateCharacterDto } from '@fwo/schemas';
import { mapValues } from 'es-toolkit';

export const getCharacter = async () => {
  const res = await client.character.$get();

  if (res.ok) {
    return res.json();
  }
};

export const createCharacter = async (json: CreateCharacterDto) => {
  return client.character
    .$post({ json })
    .then((r) => r.json())
    .catch(console.log);
};

export const changeCharacterAttributes = async (attributes: CharacterAttributes) => {
  return client.character.attributes
    .$patch({ json: attributes })
    .then((r) => r.json())
    .catch(console.log);
};

export const deleteCharacter = async () => {
  return client.character.$delete().catch(console.log);
};

export const getCharacterDynamicAttributes = async (attributes: CharacterAttributes) => {
  return client.character['dynamic-attributes']
    .$get({ query: mapValues(attributes, (n) => n.toString()) })
    .then((r) => r.json())
    .catch(console.log);
};
