import { invoice } from '@tma.js/sdk-react';
import { getResetAttributesInvoice, resetAttributes } from '@/api/serviceShop';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';

export const useServiceShopResetAttributes = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();
  const popup = usePopup();

  const resetAttributesByStars = () => {
    makeRequest(async () => {
      const { url } = await getResetAttributesInvoice();

      invoice.openUrl(url).then((status) => {
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
        const res = await makeRequest(() => resetAttributes());
        if (res) {
          popup.info({ message: 'Характеристики успешно сброшены' });
          syncCharacter();
        }
      },
    });
  };

  return {
    resetAttributesByStars,
    resetAttributesByComponents,
    loading,
  };
};
