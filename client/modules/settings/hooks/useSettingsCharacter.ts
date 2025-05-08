import { deleteCharacter } from '@/api/character';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useSocketStore } from '@/stores/socket';

export const useSettingsCharacter = () => {
  const { clearCharacter } = useSyncCharacter();
  const disconnect = useSocketStore((state) => state.disconnect);
  const [_, makeRequest] = useRequest();
  const popup = usePopup();

  const removeCharacter = () => {
    popup.confirm({
      title: 'Удаление персонажа',
      message: 'Персонаж будет удалён навсегда',
      onConfirm: () =>
        makeRequest(async () => {
          await deleteCharacter();
          await clearCharacter();
          disconnect();
        }),
    });
  };

  return {
    removeCharacter,
  };
};
