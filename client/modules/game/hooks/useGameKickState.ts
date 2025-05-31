import { usePopup } from '@/hooks/usePopup';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';
import type { ServerToClientMessage } from '@fwo/shared';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export function useGameKickState() {
  const popup = usePopup();
  const navigate = useNavigate();
  const characterID = useCharacter((character) => character.id);
  const { syncCharacter } = useSyncCharacter();

  const handlePreKick = useCallback(() => {
    popup.info({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  }, [popup.info]);

  const handleKick = useCallback(
    async ({ player }: Parameters<ServerToClientMessage['game:kick']>[0]) => {
      if (player.id === characterID) {
        await syncCharacter();
        navigate('/');
        popup.info({ message: 'Вы были выброшены из игры' });
      }
    },
    [navigate, characterID, syncCharacter, popup.info],
  );

  useSocketListener('game:preKick', handlePreKick);
  useSocketListener('game:kick', handleKick);
}
