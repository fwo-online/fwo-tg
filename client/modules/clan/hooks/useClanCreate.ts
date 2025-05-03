import { createClan } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { popup } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router';

export const useClanCreate = () => {
  const [_, makeRequest] = useRequest();
  const navigate = useNavigate();
  const { syncCharacter } = useSyncCharacter();

  const create = async (name: string) => {
    await makeRequest(async () => {
      const clan = await createClan(name);
      if (clan) {
        popup.open({ message: 'Клан создан' });
        await syncCharacter();

        navigate('/clan');
      }
    });
  };

  return {
    createClan: create,
  };
};
