import { getResetAttributesInvoice, resetAttributes } from '@/api/serviceShop';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { invoice } from '@telegram-apps/sdk-react';

export const useServiceShopResetAttributes = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();
  const popup = usePopup();

  const resetAttributesByStars = () => {
    makeRequest(async () => {
      const { url } = await getResetAttributesInvoice();

      invoice.open(url, 'url').then((status) => {
        if (status === 'paid') {
          syncCharacter();
          popup.info({ message: 'Характеристики успешно сброшены' });
        }
        if (status === 'cancelled' || status === 'failed') {
          popup.info({ message: 'Что-то пошло не так' });
        }
      });
    });
  };

  const resetAttributesByComponents = () => {
    popup.confirm({
      message: 'Вы уверены, что хотите сбросить характеристики?',
      onConfirm: async () => {
        await makeRequest(() => resetAttributes());
        syncCharacter();
        popup.info({ message: 'Характеристики успешно сброшены' });
      },
    });
  };

  return {
    resetAttributesByStars,
    resetAttributesByComponents,
    loading,
  };
};
