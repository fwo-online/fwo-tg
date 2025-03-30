import { acceptClanRequest, rejectClanRequest } from '@/api/clan';
import { useCharacter } from '@/contexts/character';
import { useRequest } from '@/hooks/useRequest';
import type { CharacterPublic } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';
import { clear } from 'suspend-react';

export const useClanRequest = () => {
  const { character } = useCharacter();
  const [isLoading, makeRequest] = useRequest();

  const acceptRequest = async (requester: CharacterPublic) => {
    const id = await popup.open({
      message: `Стоимость принятия заявки ${requester.lvl * 50}💰`,
      buttons: [
        {
          id: 'close',
          type: 'close',
        },
        {
          id: 'ok',
          type: 'ok',
        },
      ],
    });

    if (id === 'ok') {
      makeRequest(async () => {
        await acceptClanRequest(requester.id);
        popup.open({
          message: 'Заявка принята',
        });
        clear([character.clan]);
      });
    }
  };

  const rejectRequest = (requester: CharacterPublic) => {
    makeRequest(async () => {
      await rejectClanRequest(requester.id);
      clear([character.clan]);
    });
  };

  return {
    isLoading,
    acceptRequest,
    rejectRequest,
  };
};
