import { acceptClanRequest, rejectClanRequest } from '@/api/clan';
import { useConfirm } from '@/hooks/useConfirm';
import { useRequest } from '@/hooks/useRequest';
import { useSyncClan } from '@/modules/clan/hooks/useSyncClan';
import { clanAcceptCostPerLvl, type CharacterPublic } from '@fwo/shared';

export const useClanRequest = () => {
  const { syncClan } = useSyncClan();
  const [_, makeRequest] = useRequest();
  const { confirm } = useConfirm();

  const acceptRequest = async (requester: CharacterPublic) => {
    confirm({
      message: `Стоимость принятия заявки ${requester.lvl * clanAcceptCostPerLvl}💰`,
      onConfirm: async () =>
        syncClan(await makeRequest(async () => acceptClanRequest(requester.id))),
    });
  };

  const rejectRequest = async (requester: CharacterPublic) => {
    syncClan(await makeRequest(async () => rejectClanRequest(requester.id)));
  };

  return {
    acceptRequest,
    rejectRequest,
  };
};
