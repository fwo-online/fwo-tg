import { equipItem, unEquipItem, sellItem } from '@/api/inventory';
import { useCharacter } from '@/contexts/character';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { groupBy } from 'es-toolkit';

export const useCharacterInventory = () => {
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();

  const inventoryByWear = groupBy(character.inventory, (item) => item.wear);

  const [_, makeRequest] = useRequest();

  const handleEquip = async (id: string) => {
    makeRequest(async () => {
      await equipItem(id);
      await updateCharacter();
    });
  };

  const handleUnEquip = async (id: string) => {
    makeRequest(async () => {
      await unEquipItem(id);
      await updateCharacter();
    });
  };

  const handleSell = async (id: string) => {
    makeRequest(async () => {
      await sellItem(id);
      await updateCharacter();
    });
  };

  return {
    handleEquip,
    handleUnEquip,
    handleSell,
    inventoryByWear,
  };
};
