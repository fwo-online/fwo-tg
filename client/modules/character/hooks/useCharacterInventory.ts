import { equipItem, unEquipItem } from '@/api/inventory';

import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';
import { groupBy } from 'es-toolkit';

export const useCharacterInventory = () => {
  const items = useCharacter((character) => character.items);
  const equipment = useCharacter((character) => character.equipment);
  const { syncCharacter } = useSyncCharacter();

  const inventoryByWear = groupBy(items, (item) => item.wear);

  const [_, makeRequest] = useRequest();

  const handleEquip = async (id: string) => {
    makeRequest(async () => {
      await equipItem(id);
      await syncCharacter();
    });
  };

  const handleUnEquip = async (id: string) => {
    makeRequest(async () => {
      await unEquipItem(id);
      await syncCharacter();
    });
  };

  return {
    handleEquip,
    handleUnEquip,
    inventoryByWear,
    items,
    equipment,
  };
};
