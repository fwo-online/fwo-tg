import { createClan } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { popup } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router';

export const useClanCreate = () => {
  const [_, makeRequest] = useRequest();
  const navigate = useNavigate();
  const { updateCharacter } = useUpdateCharacter();

  const create = async (name: string) => {
    const clan = await makeRequest(() => createClan(name));
    if (clan) {
      popup.open({ message: 'Клан создан' });
      await updateCharacter();

      navigate('/clan');
    }
  };

  return {
    createClan: create,
  };
};
