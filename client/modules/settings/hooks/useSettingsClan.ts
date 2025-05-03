import { deleteClan, leaveClan } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { popup } from '@telegram-apps/sdk-react';

export const useSettingsClan = () => {
  const { syncCharacter } = useSyncCharacter();
  const [_, makeRequest] = useRequest();

  const remove = async () => {
    const buttonId = await popup.open({
      title: 'Удаление клана',
      message: 'Клан будет удалён навсегда',
      buttons: [{ text: 'Удалить', type: 'destructive', id: 'delete' }, { type: 'cancel' }],
    });

    if (buttonId === 'delete') {
      await makeRequest(async () => {
        await deleteClan();
        await syncCharacter();
      });
      popup.open({ message: 'Клан был удалён' });
    }
  };

  const leave = async () => {
    const buttonId = await popup.open({
      message: 'Выход из клана',
      buttons: [{ text: 'Покинуть', type: 'destructive', id: 'leave' }, { type: 'cancel' }],
    });

    if (buttonId === 'leave') {
      await makeRequest(async () => {
        await leaveClan();
        await syncCharacter();
      });
      popup.open({ message: 'Ты покинул клан' });
    }
  };

  return {
    removeClan: remove,
    leaveClan: leave,
  };
};
