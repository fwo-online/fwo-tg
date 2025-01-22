import type { FC } from 'react';
import { useParams } from 'react-router';
import { ShopList } from '../components/ShopList';
import { getShopItems } from '@/client/shop';
import { Headline, List, Text } from '@telegram-apps/telegram-ui';
import { ShopItemModal } from '../components/ShopItemModal';
import { buyItem } from '@/client/character';
import type { Item } from '@fwo/schemas';
import { popup } from '@telegram-apps/sdk-react';

export const ShopListPage: FC = () => {
  const { wear } = useParams();

  const handleBuy = async (item: Item) => {
    try {
      await buyItem(item.code);
    } catch (e) {
      popup.open(e);
    }
  };
  return (
    <List>
      <Headline>Магазин</Headline>
      <Text>{wear}</Text>
      <ShopList
        shopPromise={getShopItems({ wear })}
        after={(item) => <ShopItemModal item={item} onBuy={handleBuy} />}
      />
    </List>
  );
};
