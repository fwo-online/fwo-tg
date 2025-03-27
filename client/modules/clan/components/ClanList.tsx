import type { Clan } from '@fwo/shared';
import type { FC } from 'react';

export const ClanList: FC<{ clans: Clan[] }> = ({ clans }) => {
  return (
    <div className="flex flex-col gap-2">
      {clans.map((clan) => (
        <div key={clan.name}>{clan.name}</div>
      ))}
    </div>
  );
};
