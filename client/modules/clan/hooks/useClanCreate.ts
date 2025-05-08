import { createClan } from '@/api/clan';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useNavigate } from 'react-router';

export const useClanCreate = () => {
  const [_, makeRequest] = useRequest();
  const navigate = useNavigate();
  const { syncCharacter } = useSyncCharacter();
  const popup = usePopup();

  const create = async (name: string) => {
    await makeRequest(async () => {
      const clan = await createClan(name);
      if (clan) {
        popup.info({ message: 'Клан создан' });
        await syncCharacter();

        navigate('/clan');
      }
    });
  };

  return {
    createClan: create,
  };
};
