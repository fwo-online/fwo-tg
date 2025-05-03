import { getResetAttributesInvoice, resetAttributes } from '@/api/serviceShop';
import { useConfirm } from '@/hooks/useConfirm';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { invoice, popup } from '@telegram-apps/sdk-react';

export const useServiceShopResetAttributes = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();
  const { confirm } = useConfirm();

  const resetAttributesByStars = () => {
    makeRequest(async () => {
      const { url } = await getResetAttributesInvoice();

      invoice.open(url, 'url').then((status) => {
        if (status === 'paid') {
          syncCharacter();
          popup.open({ message: 'Характеристики успешно сброшены' });
        }
        if (status === 'cancelled' || status === 'failed') {
          popup.open({ message: 'Что-то пошло не так' });
        }
      });
    });
  };

  const resetAttributesByComponents = () => {
    confirm({
      message: 'Вы уверены, что хотите сбросить характеристики?',
      onConfirm: async () => {
        await makeRequest(() => resetAttributes());
        syncCharacter();
        popup.open({ message: 'Характеристики успешно сброшены' });
      },
    });
  };

  return {
    resetAttributesByStars,
    resetAttributesByComponents,
    loading,
  };
};
