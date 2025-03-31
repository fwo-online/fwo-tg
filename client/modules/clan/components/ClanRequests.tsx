import { useClanRequest } from '../hooks/useClanRequest';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import type { CharacterPublic } from '@fwo/shared';
import { useClanStore } from '@/modules/clan/contexts/useClan';

export const ClanRequests: FC<{ character: CharacterPublic }> = ({ character }) => {
  const { acceptRequest, rejectRequest } = useClanRequest();
  const loading = useClanStore((state) => state.loading);

  return (
    <div className="flex gap-4 mb-4">
      <Button className="is-success" disabled={loading} onClick={() => acceptRequest(character)}>
        ✔
      </Button>
      <Button className="is-error" disabled={loading} onClick={() => rejectRequest(character)}>
        ✖
      </Button>
    </div>
  );
};
