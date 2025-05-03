import { useClanRequest } from '../hooks/useClanRequest';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import type { CharacterPublic } from '@fwo/shared';

export const ClanRequests: FC<{ character: CharacterPublic }> = ({ character }) => {
  const { acceptRequest, rejectRequest } = useClanRequest();

  return (
    <div className="flex gap-4 mb-4">
      <Button className="is-success" onClick={() => acceptRequest(character)}>
        ✔
      </Button>
      <Button className="is-error" onClick={() => rejectRequest(character)}>
        ✖
      </Button>
    </div>
  );
};
