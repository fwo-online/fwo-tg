import type { Clan } from '@fwo/shared';
import type { FC } from 'react';

export const ClanComponent: FC<{ clan: Clan }> = ({ clan }) => {
  return (
    <div>
      {clan.gold} {clan.lvl}
    </div>
  );
};
