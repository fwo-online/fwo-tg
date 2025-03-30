import { upgradeClanLvl } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { type Clan, clanLvlCost } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';
import { clear } from 'suspend-react';

export const useClanLvl = () => {
  const [_, makeRequest] = useRequest();

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
      makeRequest(async () => {
        await upgradeClanLvl();
        popup.open({
          message: 'Уровень клана повышен',
        });
        clear([clan.id]);
      });
    }
  };

  return {
    upgradeLvl,
  };
};
