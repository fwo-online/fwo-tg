import { changeName, getChangeNameInvoice } from '@/api/serviceShop';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { invoice } from '@telegram-apps/sdk-react';

export const useServiceShopChangeName = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();
  const popup = usePopup();

  const changeNameByStars = (name: string) => {
    makeRequest(async () => {
      const { url } = await getChangeNameInvoice(name);

      invoice.open(url, 'url').then((status) => {
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
        makeRequest(() => changeName(name));
        await syncCharacter();
        popup.info({ message: 'Имя успешно изменено' });
      },
    });
  };

  return {
    changeNameByStars,
    changeNameByComponents,
    loading,
  };
};
