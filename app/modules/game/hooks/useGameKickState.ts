import { useCharacter } from '@/contexts/character';
import { useWebSocket } from '@/contexts/webSocket';
import type { ServerToClientMessage } from '@fwo/schemas';
import { popup } from '@telegram-apps/sdk-react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function useGameKickState() {
  const socket = useWebSocket();
  const navigate = useNavigate();
  const { character } = useCharacter();

  const handlePreKick = useCallback(() => {
    popup.open({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  }, []);

  const handleKick = useCallback(
    async ({ player }: Parameters<ServerToClientMessage['game:kick']>[0]) => {
      if (player.id === character.id) {
        navigate('/');
        await popup.open({ message: 'Вы были выброшены из игры' });
      }
    },
    [navigate, character],
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
