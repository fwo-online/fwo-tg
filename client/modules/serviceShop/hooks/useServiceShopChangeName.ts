import { changeName, getChangeNameInvoice } from '@/api/serviceShop';
import { useConfirm } from '@/hooks/useConfirm';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { invoice, popup } from '@telegram-apps/sdk-react';

export const useServiceShopChangeName = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();
  const { confirm } = useConfirm();

  const changeNameByStars = (name: string) => {
    makeRequest(async () => {
      const { url } = await getChangeNameInvoice(name);

      invoice.open(url, 'url').then((status) => {
        if (status === 'paid') {
          syncCharacter();
          popup.open({ message: 'Имя успешно изменено' });
        }
        if (status === 'cancelled' || status === 'failed') {
          popup.open({ message: 'Что-то пошло не так' });
        }
      });
    });
  };

  const changeNameByComponents = (name: string) => {
    confirm({
      message: 'Вы уверены, что изменить имя?',
      onConfirm: async () => {
        makeRequest(() => changeName(name));
        await syncCharacter();
        popup.open({ message: 'Имя успешно изменено' });
      },
    });
  };

  return {
    changeNameByStars,
    changeNameByComponents,
    loading,
  };
};
