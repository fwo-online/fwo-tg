import { useCharacter } from '@/contexts/character';
import { useModal } from '@/contexts/modal';
import { useWebSocket } from '@/contexts/webSocket';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import type { ServerToClientMessage } from '@fwo/shared';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function useGameKickState() {
  const socket = useWebSocket();
  const navigate = useNavigate();
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();
  const modal = useModal();

  const handlePreKick = useCallback(() => {
    modal.info({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  }, [modal]);

  const handleKick = useCallback(
    async ({ player }: Parameters<ServerToClientMessage['game:kick']>[0]) => {
      if (player.id === character.id) {
        await updateCharacter();
        navigate('/');
        modal.info({ message: 'Вы были выброшены из игры' });
      }
    },
    [navigate, character, updateCharacter, modal],
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
