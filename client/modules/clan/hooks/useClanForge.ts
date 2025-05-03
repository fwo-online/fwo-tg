import { openClanForge } from '@/api/clan';
import { useConfirm } from '@/hooks/useConfirm';
import { useRequest } from '@/hooks/useRequest';
import { useSyncClan } from '@/modules/clan/hooks/useSyncClan';
import { useClan } from '@/modules/clan/store/clan';
import { clanForgeCostMultiplier, clanLvlCost } from '@fwo/shared';

export const useClanForge = () => {
  const [_, makeRequest] = useRequest();
  const { syncClan } = useSyncClan();
  const lvl = useClan((clan) => clan.lvl);
  const { confirm } = useConfirm();

  const openForge = async () => {
    confirm({
      title: 'Открыть кузницу?',
      message: `Стоимость открытия ${clanLvlCost[lvl - 1] * clanForgeCostMultiplier}💰. Кузница закроется через месяц`,
      onConfirm: async () => {
        syncClan(await makeRequest(openClanForge));
      },
    });
  };

  return {
    openForge,
  };
};
