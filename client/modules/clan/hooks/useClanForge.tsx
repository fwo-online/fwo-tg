import { openClanForge } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useClanStore } from '@/modules/clan/contexts/useClan';
import { clanForgeCostMultiplier, clanLvlCost } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';

export const useClanForge = () => {
  const [_, makeRequest] = useRequest();
  const updateClan = useClanStore((state) => state.updateClan);
  const lvl = useClanStore((state) => state.clan.lvl);

  const openForge = async () => {
    const id = await popup.open({
      title: 'Открыть кузницу?',
      message: `Стоимость открытия ${clanLvlCost[lvl - 1] * clanForgeCostMultiplier}💰. Кузница закроется через месяц`,
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
      updateClan(makeRequest(async () => await openClanForge()));
    }
  };

  return {
    openForge,
  };
};
