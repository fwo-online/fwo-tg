import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useItemComponents } from '@/modules/items/hooks/useItemComponents';
import { useServiceShopChangeName } from '@/modules/serviceShop/hooks/useServiceShopChangeName';
import { InvoiceType, invoiceTypes, ItemComponent } from '@fwo/shared';
import { useState, type FC } from 'react';

const { components, stars, title } = invoiceTypes[InvoiceType.ChangeName];

export const ServiceShopChangeNickname: FC = () => {
  const [nickname, setNickname] = useState('');
  const { getComponentImage } = useItemComponents();
  const { loading, changeNameByComponents, changeNameByStars } = useServiceShopChangeName();

  return (
    <Card header={title}>
      <div className="flex flex-col gap-2">
        <input
          className="nes-input"
          placeholder="Введите имя"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={loading || !nickname}
            onClick={() => changeNameByComponents(nickname)}
          >
            <div className="flex justify-center">
              {components.arcanite} <img src={getComponentImage(ItemComponent.Arcanite)} />
            </div>
          </Button>
          <Button
            className="flex-1"
            disabled={loading || !nickname}
            onClick={() => changeNameByStars(nickname)}
          >
            {stars}⭐
          </Button>
        </div>
      </div>
    </Card>
  );
};
