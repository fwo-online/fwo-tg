import { usePopup } from '@/hooks/usePopup';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import type { ServerToClientMessage } from '@fwo/shared';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function useGameKickState() {
  const popup = usePopup();
  const socket = useSocket();
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

  useEffect(() => {
    socket.on('game:preKick', handlePreKick);
    socket.on('game:kick', handleKick);

    return () => {
      socket.off('game:preKick', handlePreKick);
      socket.off('game:kick', handleKick);
    };
  }, [socket.on, socket.off, handlePreKick, handleKick]);
}
