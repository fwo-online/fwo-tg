import { upgradeClanLvl } from '@/api/clan';
import { useConfirm } from '@/hooks/useConfirm';
import { useRequest } from '@/hooks/useRequest';
import { useSyncClan } from '@/modules/clan/hooks/useSyncClan';
import { clanLvlCost } from '@fwo/shared';

export const useClanLvl = () => {
  const [_, makeRequest] = useRequest();
  const { syncClan } = useSyncClan();
  const { confirm } = useConfirm();

  const upgradeLvl = async (lvl: number) => {
    confirm({
      message: `Стоимость следующего уровня ${clanLvlCost[lvl]}💰`,
      onConfirm: async () => {
        syncClan(await makeRequest(async () => await upgradeClanLvl()));
      },
    });
  };

  return {
    upgradeLvl,
  };
};
