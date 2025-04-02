import { ServiceShopChangeNickname } from '@/modules/serviceShop/components/ServiceShopChangeNickname';
import { ServiceShopDonation } from '@/modules/serviceShop/components/ServiceShopDonation';
import { ServiceShopResetAttributes } from '@/modules/serviceShop/components/ServiceShopResetAttributes';

import type { FC } from 'react';

export const ServiceShop: FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <ServiceShopResetAttributes />
      <ServiceShopChangeNickname />
      <ServiceShopDonation />
    </div>
  );
};
