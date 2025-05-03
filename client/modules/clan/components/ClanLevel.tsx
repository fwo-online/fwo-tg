import { Button } from '@/components/Button';

import type { FC } from 'react';
import { useClanOwner } from '@/modules/clan/hooks/useClanOwner';
import { useClanLvl } from '@/modules/clan/hooks/useClanLvl';
import { clanLvlCost } from '@fwo/shared';
import { useClan } from '@/modules/clan/store/clan';

export const ClanLevel: FC = () => {
  const lvl = useClan((clan) => clan.lvl);
  const { upgradeLvl } = useClanLvl();
  const { isOwner } = useClanOwner();

  if (!isOwner || lvl >= clanLvlCost.length) {
    return null;
  }

  return <Button onClick={() => upgradeLvl(lvl)}>Повысить уровень</Button>;
};
