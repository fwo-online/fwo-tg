import { Card } from '@/components/Card';
import { ServiceShop } from '@/modules/serviceShop/components/ServiceShop';
import type { FC } from 'react';

export const ServiceShopPage: FC = () => {
  return (
    <Card header="Седой торговец" className="m-4">
      <h5 className="mb-4">Продавец необычных услуг и уникальных возможностей</h5>
      <ServiceShop />
    </Card>
  );
};
