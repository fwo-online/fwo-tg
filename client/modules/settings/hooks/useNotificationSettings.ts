import type { NotificationType } from '@fwo/shared';
import { updateNotificationSettings } from '@/api/character';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';

export const useNotificationSettings = () => {
  const character = useCharacter();
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();

  const toggleNotification = async (type: NotificationType, enabled: boolean) => {
    await makeRequest(async () => {
      await updateNotificationSettings({ [type]: enabled });
      await syncCharacter();
    });
  };

  const getNotificationEnabled = (type: NotificationType): boolean => {
    return character.notificationSettings?.[type] ?? false;
  };

  return {
    toggleNotification,
    getNotificationEnabled,
    loading,
  };
};
