import { invoice } from '@tma.js/sdk-react';
import { changeName, getChangeNameInvoice } from '@/api/serviceShop';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';

export const useServiceShopChangeName = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();
  const popup = usePopup();

  const changeNameByStars = (name: string) => {
    makeRequest(async () => {
      const { url } = await getChangeNameInvoice(name);

      invoice.openUrl(url).then((status) => {
        if (status === 'paid') {
          syncCharacter();
          popup.info({ message: 'Имя успешно изменено' });
        }
        if (status === 'cancelled' || status === 'failed') {
          popup.info({ message: 'Что-то пошло не так' });
        }
      });
    });
  };

  const changeNameByComponents = (name: string) => {
    popup.confirm({
      message: 'Вы уверены, что изменить имя?',
      onConfirm: async () => {
        const res = await makeRequest(() => changeName(name));
        if (res) {
          await syncCharacter();
          popup.info({ message: 'Имя успешно изменено' });
        }
      },
    });
  };

  return {
    changeNameByStars,
    changeNameByComponents,
    loading,
  };
};
