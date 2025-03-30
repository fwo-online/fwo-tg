import { acceptClanRequest, rejectClanRequest } from '@/api/clan';
import { useCharacter } from '@/contexts/character';
import { useRequest } from '@/hooks/useRequest';
import { clanAcceptCostPerLvl, type CharacterPublic } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';
import { clear } from 'suspend-react';

export const useClanRequest = () => {
  const { character } = useCharacter();
  const [isLoading, makeRequest] = useRequest();

  const acceptRequest = async (requester: CharacterPublic) => {
    const id = await popup.open({
      message: `Стоимость принятия заявки ${requester.lvl * clanAcceptCostPerLvl}💰`,
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
        clear([character.clan?.id]);
      });
    }
  };

  const rejectRequest = (requester: CharacterPublic) => {
    makeRequest(async () => {
      await rejectClanRequest(requester.id);
      clear([character.clan?.id]);
    });
  };

  return {
    isLoading,
    acceptRequest,
    rejectRequest,
  };
};
