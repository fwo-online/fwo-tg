import { useLocation, useNavigate } from 'react-router';
import { useCallback, useEffect } from 'react';
import { useCharacterStore } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import { useMountEffect } from '@/hooks/useMountEffect';

export const useGameGuard = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const game = useCharacterStore((state) => state.character?.game);
  const setGame = useCharacterStore((state) => state.setGame);

  const navigateToGame = useCallback(
    (gameID: string) => {
      setGame(gameID);
      navigate(`/game/${gameID}`);
    },
    [navigate, setGame],
  );

  useEffect(() => {
    socket.on('game:start', navigateToGame);

    return () => {
      socket.off('game:start', navigateToGame);
    };
  }, [socket.on, socket.off, navigateToGame]);

  useMountEffect(() => {
    if (game) {
      navigateToGame(game);
    }

    if (!game && location.pathname.startsWith('/game')) {
      navigate('/');
    }
  });
};
