import { deleteClan, leaveClan } from '@/api/clan';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';

export const useSettingsClan = () => {
  const { syncCharacter } = useSyncCharacter();
  const [_, makeRequest] = useRequest();
  const popup = usePopup();

  const remove = async () => {
    await popup.confirm({
      title: 'Удаление клана',
      message: 'Клан будет удалён навсегда',
      onConfirm: async () => {
        await makeRequest(async () => {
          await deleteClan();
          await syncCharacter();
        });
        popup.info({ message: 'Клан был удалён' });
      },
    });
  };

  const leave = async () => {
    await popup.confirm({
      message: 'Выход из клана',
      onConfirm: async () => {
        makeRequest(async () => {
          await leaveClan();
          await syncCharacter();
        });
        popup.info({ message: 'Ты покинул клан' });
      },
    });
  };

  return {
    removeClan: remove,
    leaveClan: leave,
  };
};
