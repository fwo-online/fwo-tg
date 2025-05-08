import { upgradeClanLvl } from '@/api/clan';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncClan } from '@/modules/clan/hooks/useSyncClan';
import { clanLvlCost } from '@fwo/shared';

export const useClanLvl = () => {
  const [_, makeRequest] = useRequest();
  const { syncClan } = useSyncClan();
  const popup = usePopup();

  const upgradeLvl = async (lvl: number) => {
    popup.confirm({
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
