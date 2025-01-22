import { getShopItems } from '@/client/shop';
import { use, useState, type FC } from 'react';
import { Link, useParams } from 'react-router';

export const ShopTypesList: FC = () => {
  return (
    <div>
      ShopTypesList <Link to="/shop/body">test</Link>
    </div>
  );
};
