import { deleteCharacter } from '@/api/character';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';

export const useSettingsCharacter = () => {
  const [_, makeRequest] = useRequest();
  const popup = usePopup();

  const removeCharacter = () => {
    popup.confirm({
      title: 'Удаление персонажа',
      message: 'Персонаж будет удалён навсегда',
      onConfirm: () =>
        makeRequest(async () => {
          await deleteCharacter();
          window.location.reload();
        }),
    });
  };

  return {
    removeCharacter,
  };
};
