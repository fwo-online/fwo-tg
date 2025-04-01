import { createInvoiceLink } from '@/api/payment';
import { resetAttributes } from '@/api/serviceShop';
import { Button } from '@/components/Button';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { useItemComponents } from '@/modules/items/hooks/useItemComponents';
import { InvoiceType, invoiceTypes, ItemComponent } from '@fwo/shared';
import { invoice, popup } from '@telegram-apps/sdk-react';

import { useState, type FC } from 'react';

const { components, stars, title } = invoiceTypes[InvoiceType.ResetAttributes];

export const ServiceShopResetAttributes: FC = () => {
  const { updateCharacter } = useUpdateCharacter();
  const [selecting, setSelecting] = useState(false);
  const { getComponentImage } = useItemComponents();
  const [loading, makeRequest] = useRequest();

  const handleStarsClick = async () => {
    const link = await createInvoiceLink(InvoiceType.ResetAttributes);

    invoice.open(link.url, 'url').then((status) => {
      if (status === 'paid') {
        updateCharacter();
        popup.open({ message: 'Характеристики успешно сброшены' });
      }
      if (status === 'cancelled' || status === 'failed') {
        popup.open({ message: 'Что-то пошло не так' });
      }
    });
  };

  const handleComponentsClick = async () => {
    makeRequest(async () => {
      const id = await popup.open({
        message: 'Вы уверены, что хотите сбросить характеристики?',
        buttons: [
          {
            id: 'close',
            type: 'close',
          },
          {
            id: 'ok',
            type: 'ok',
          },
        ],
      });
      if (id === 'ok') {
        await resetAttributes();
        updateCharacter();
        popup.open({ message: 'Характеристики успешно сброшены' });
      }
    });
  };

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
