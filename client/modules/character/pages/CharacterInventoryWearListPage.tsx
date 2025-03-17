import { useNavigate } from 'react-router';
import type { FC } from 'react';
import { ItemsWearList } from '@/modules/items/components/ItemsWearList';
import { useCharacter } from '@/contexts/character';
import { Card } from '@/components/Card';

export const CharacterInventoryWearListPage: FC = () => {
  const { character } = useCharacter();
  const navigate = useNavigate();

  const handleClick = (wear: string) => {
    navigate(`/character/inventory/${wear}`);
  };

  const getEquippedItem = (wear: string) => {
    return character.inventory.find((item) => item.wear === wear && item.putOn)?.item.info.name;
  };

  return (
    <Card header="Инвентарь" className="m-4!">
      <ItemsWearList
        onClick={handleClick}
        after={(wear) => <span className="opacity-50">{getEquippedItem(wear)}</span>}
      />
    </Card>
  );
};
