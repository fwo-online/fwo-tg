import { deleteCharacter } from '@/api/character';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { popup } from '@telegram-apps/sdk-react';

export const useSettingsCharacter = () => {
  const { updateCharacter } = useUpdateCharacter();
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
        await updateCharacter();
      });
    }
  };

  return {
    removeCharacter,
  };
};
