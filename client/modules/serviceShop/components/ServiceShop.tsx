import { useCharacter } from '@/contexts/character';
import { ServiceShopResetAttributes } from '@/modules/serviceShop/components/ServiceShopResetAttributes';

import type { FC } from 'react';

export const ServiceShop: FC = () => {
  const { character } = useCharacter();

  if (character.name !== 'Evgewa') {
    return null;
  }

  return (
    <div className="flex flex-col">
      <ServiceShopResetAttributes />
    </div>
  );
};
