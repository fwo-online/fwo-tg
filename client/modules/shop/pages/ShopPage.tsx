import type { FC } from 'react';
import { ShopWearList } from '../components/ShopWearList';
import { Card } from '@/components/Card';

export const ShopPage: FC = () => {
  return (
    <Card header="Магазин" className="m-4!">
      <ShopWearList />
    </Card>
  );
};
