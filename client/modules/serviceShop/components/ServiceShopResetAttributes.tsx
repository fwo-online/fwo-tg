import { Button } from '@/components/Button';
import { useItemComponents } from '@/modules/items/hooks/useItemComponents';
import { useServiceShopResetAttributes } from '@/modules/serviceShop/hooks/useServiceShopResetAttributes';
import { InvoiceType, invoiceTypes, ItemComponent } from '@fwo/shared';

import { useState, type FC } from 'react';

const { components, stars, title } = invoiceTypes[InvoiceType.ResetAttributes];

export const ServiceShopResetAttributes: FC = () => {
  const [selecting, setSelecting] = useState(false);
  const { getComponentImage } = useItemComponents();
  const { loading, handleStarsClick, handleComponentsClick } = useServiceShopResetAttributes();

  if (selecting) {
    return (
      <div className="flex gap-2">
        <Button className="flex-1" disabled={loading} onClick={handleComponentsClick}>
          <div className="flex justify-center">
            {components.arcanite} <img src={getComponentImage(ItemComponent.Arcanite)} />
          </div>
        </Button>
        <Button className="flex-1" disabled={loading} onClick={handleStarsClick}>
          {stars}⭐
        </Button>
        <Button className="is-error" onClick={() => setSelecting(false)}>
          ✖
        </Button>
      </div>
    );
  }

  return <Button onClick={() => setSelecting(true)}>{title}</Button>;
};
