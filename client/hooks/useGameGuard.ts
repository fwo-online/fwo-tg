import { useNavigate } from 'react-router';
import { useWebSocket } from '@/contexts/webSocket';
import { useCallback, useEffect } from 'react';

export const useGameGuard = () => {
  const socket = useWebSocket();
  const navigate = useNavigate();

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
};
