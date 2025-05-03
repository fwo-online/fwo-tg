import { deleteCharacter } from '@/api/character';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useSocketStore } from '@/stores/socket';
import { popup } from '@telegram-apps/sdk-react';

export const useSettingsCharacter = () => {
  const { clearCharacter } = useSyncCharacter();
  const disconnect = useSocketStore((state) => state.disconnect);
  const [_, makeRequest] = useRequest();

  const removeCharacter = async () => {
    const buttonId = await popup.open({
      title: 'Удаление персонажа',
      message: 'Персонаж будет удалён навсегда',
      buttons: [{ text: 'Удалить', type: 'destructive', id: 'delete' }, { type: 'cancel' }],
    });

    if (buttonId === 'delete') {
      await makeRequest(async () => {
        await deleteCharacter();
        await clearCharacter();
        await disconnect();
      });
    }
  };

  return {
    removeCharacter,
  };
};
