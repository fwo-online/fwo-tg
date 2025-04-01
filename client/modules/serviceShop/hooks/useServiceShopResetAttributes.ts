import { createInvoiceLink } from '@/api/payment';
import { resetAttributes } from '@/api/serviceShop';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { InvoiceType } from '@fwo/shared';
import { invoice, popup } from '@telegram-apps/sdk-react';

export const useServiceShopResetAttributes = () => {
  const { updateCharacter } = useUpdateCharacter();
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

  return {
    handleStarsClick,
    handleComponentsClick,
    loading,
  };
};
