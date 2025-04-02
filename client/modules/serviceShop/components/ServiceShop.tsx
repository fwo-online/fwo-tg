import { useCharacter } from '@/contexts/character';
import { ServiceShopChangeNickname } from '@/modules/serviceShop/components/ServiceShopChangeNickname';
import { ServiceShopDonation } from '@/modules/serviceShop/components/ServiceShopDonation';
import { ServiceShopResetAttributes } from '@/modules/serviceShop/components/ServiceShopResetAttributes';

import type { FC } from 'react';

export const ServiceShop: FC = () => {
  const { character } = useCharacter();
  return (
    <div className="flex flex-col gap-8">
      <ServiceShopResetAttributes />
      <ServiceShopChangeNickname />
      {character.id === '67dd3bd7c271a11386a7e074' && <ServiceShopDonation />}
    </div>
  );
};
