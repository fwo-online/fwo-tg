import { upgradeClanLvl } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useClanStore } from '@/modules/clan/contexts/useClan';
import { type Clan, clanLvlCost } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';

export const useClanLvl = () => {
  const [_, makeRequest] = useRequest();
  const updateClan = useClanStore((state) => state.updateClan);

  const upgradeLvl = async (clan: Clan) => {
    const id = await popup.open({
      message: `Стоимость следующего уровня ${clanLvlCost[clan.lvl]}💰`,
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
      updateClan(
        makeRequest(async () => {
          const clan = await upgradeClanLvl();
          popup.open({
            message: 'Уровень клана повышен',
          });
          return clan;
        }),
      );
    }
  };

  return {
    upgradeLvl,
  };
};
