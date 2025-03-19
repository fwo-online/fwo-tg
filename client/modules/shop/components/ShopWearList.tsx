import { ItemsWearList } from '@/modules/items/components/ItemsWearList';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

export const ShopWearList: FC = () => {
  const navigate = useNavigate();

  const onClick = (wear: string) => {
    navigate(`/shop/${wear}`);
  };

  return <ItemsWearList onClick={onClick} />;
};
