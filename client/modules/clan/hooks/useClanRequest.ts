import { acceptClanRequest, rejectClanRequest } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useClanStore } from '@/modules/clan/contexts/useClan';
import { clanAcceptCostPerLvl, type CharacterPublic } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';

export const useClanRequest = () => {
  const updateClan = useClanStore((state) => state.updateClan);
  const [_, makeRequest] = useRequest();

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
      updateClan(makeRequest(async () => acceptClanRequest(requester.id)));
    }
  };

  const rejectRequest = (requester: CharacterPublic) => {
    updateClan(makeRequest(async () => rejectClanRequest(requester.id)));
  };

  return {
    acceptRequest,
    rejectRequest,
  };
};
