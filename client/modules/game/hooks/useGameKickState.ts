import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import type { ServerToClientMessage } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function useGameKickState() {
  const socket = useSocket();
  const navigate = useNavigate();
  const characterID = useCharacter((character) => character.id);
  const { syncCharacter } = useSyncCharacter();

  const handlePreKick = useCallback(() => {
    popup.open({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  }, []);

  const handleKick = useCallback(
    async ({ player }: Parameters<ServerToClientMessage['game:kick']>[0]) => {
      if (player.id === characterID) {
        await syncCharacter();
        navigate('/');
        popup.open({ message: 'Вы были выброшены из игры' });
      }
    },
    [navigate, characterID, syncCharacter],
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
