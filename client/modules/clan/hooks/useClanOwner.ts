import { useCharacter } from '@/modules/character/store/character';
import { useClan } from '@/modules/clan/store/clan';

export const useClanOwner = () => {
  const characterID = useCharacter((character) => character.id);
  const ownerID = useClan((clan) => clan.owner);

  const isOwner = characterID === ownerID;

  return {
    isOwner,
  };
};
