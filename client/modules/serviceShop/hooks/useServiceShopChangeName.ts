import { changeName, getChangeNameInvoice } from '@/api/serviceShop';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { invoice, popup } from '@telegram-apps/sdk-react';

export const useServiceShopChangeName = () => {
  const { updateCharacter } = useUpdateCharacter();
  const [loading, makeRequest] = useRequest();

  const changeNameByStars = (name: string) => {
    makeRequest(async () => {
      const { url } = await getChangeNameInvoice(name);

      invoice.open(url, 'url').then((status) => {
        if (status === 'paid') {
          updateCharacter();
          popup.open({ message: 'Имя успешно изменено' });
        }
        if (status === 'cancelled' || status === 'failed') {
          popup.open({ message: 'Что-то пошло не так' });
        }
      });
    });
  };

  const changeNameByComponents = (name: string) => {
    makeRequest(async () => {
      const id = await popup.open({
        message: 'Вы уверены, что изменить имя?',
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
        await changeName(name);
        updateCharacter();
        popup.open({ message: 'Имя успешно изменено' });
      }
    });
  };

  return {
    changeNameByStars,
    changeNameByComponents,
    loading,
  };
};
