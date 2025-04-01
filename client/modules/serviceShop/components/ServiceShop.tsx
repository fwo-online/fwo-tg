import { ServiceShopChangeNickname } from '@/modules/serviceShop/components/ServiceShopChangeNickname';
import { ServiceShopResetAttributes } from '@/modules/serviceShop/components/ServiceShopResetAttributes';

import type { FC } from 'react';

export const ServiceShop: FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <ServiceShopResetAttributes />
      <ServiceShopChangeNickname />
    </div>
  );
};
