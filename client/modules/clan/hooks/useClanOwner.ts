import { useCharacter } from '@/contexts/character';
import { useClanStore } from '@/modules/clan/contexts/useClan';

export const useClanOwner = () => {
  const { character } = useCharacter();
  const owner = useClanStore((state) => state.clan.owner);

  const isOwner = character.id === owner;

  return {
    isOwner,
  };
};
