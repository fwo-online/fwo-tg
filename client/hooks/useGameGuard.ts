import { useNavigate } from 'react-router';
import { useWebSocket } from '@/contexts/webSocket';
import { useCallback, useEffect } from 'react';
import { useMountEffect } from './useMountEffect';
import { useCharacter } from '@/contexts/character';

export const useGameGuard = () => {
  const socket = useWebSocket();
  const navigate = useNavigate();
  const { character } = useCharacter();

  const navigateToGame = useCallback(
    (gameID: string) => {
      navigate(`/game/${gameID}`);
    },
    [navigate],
  );

  useEffect(() => {
    socket.on('game:start', navigateToGame);

    return () => {
      socket.off('game:start', navigateToGame);
    };
  }, [socket.on, socket.off, navigateToGame]);

  useMountEffect(() => {
    if (character.game) {
      navigateToGame(character.game);
    }
  });
};
