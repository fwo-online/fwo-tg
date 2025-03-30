import { ClanListItem } from '@/modules/clan/components/ClanListItem';
import type { Clan } from '@fwo/shared';
import type { FC } from 'react';

export const ClanList: FC<{
  clans: Clan[];
  isLoading: boolean;
  isRequested: (clan: Clan) => boolean;
  onCreateRequest: (id: string) => void;
  onCancelRequest: (id: string) => void;
}> = ({ clans, isLoading, isRequested, onCreateRequest, onCancelRequest }) => {
  return (
    <div className="flex flex-col gap-2">
      {clans.map((clan) => (
        <ClanListItem
          key={clan.id}
          clan={clan}
          isLoading={isLoading}
          requested={isRequested(clan)}
          onCreateRequest={onCreateRequest}
          onCancelRequest={onCancelRequest}
        />
      ))}
    </div>
  );
};
