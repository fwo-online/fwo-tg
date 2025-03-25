import { client, createRequest } from '@/api';
import type { CharacterAttributes, CreateCharacterDto } from '@fwo/shared';
import { mapValues } from 'es-toolkit';

export const getCharacter = async () => {
  const res = await client.character.$get();

  if (res.ok) {
    return res.json();
  }
};

export const createCharacter = async (json: CreateCharacterDto) => {
  return createRequest(client.character.$post)({ json });
};

export const changeCharacterAttributes = async (json: CharacterAttributes) => {
  return createRequest(client.character.attributes.$patch)({ json });
};

export const deleteCharacter = async () => {
  return createRequest(client.character.$delete)({});
};

export const getCharacterDynamicAttributes = async (attributes: CharacterAttributes) => {
  return createRequest(client.character['dynamic-attributes'].$get)({
    query: mapValues(attributes, (n) => n.toString()),
  });
};
