import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useItemComponents } from '@/modules/items/hooks/useItemComponents';
import { useServiceShopResetAttributes } from '@/modules/serviceShop/hooks/useServiceShopResetAttributes';
import { InvoiceType, invoiceTypes, ItemComponent } from '@fwo/shared';
import type { FC } from 'react';

const { components, stars, title } = invoiceTypes[InvoiceType.ResetAttributes];

export const ServiceShopResetAttributes: FC = () => {
  const { getComponentImage } = useItemComponents();
  const { loading, resetAttributesByComponents, resetAttributesByStars } =
    useServiceShopResetAttributes();

  return (
    <Card header={title}>
      <div className="flex gap-2">
        <Button className="flex-1" disabled={loading} onClick={resetAttributesByComponents}>
          <div className="flex justify-center">
            {components.arcanite} <img src={getComponentImage(ItemComponent.Arcanite)} />
          </div>
        </Button>
        <Button className="flex-1" disabled={loading} onClick={resetAttributesByStars}>
          {stars}⭐
        </Button>
      </div>
    </Card>
  );
};
