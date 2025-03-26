import { useLocation, useNavigate } from 'react-router';
import { useWebSocket } from '@/contexts/webSocket';
import { useCallback, useEffect } from 'react';
import { useCharacter } from '@/contexts/character';
import { useMountEffect } from './useMountEffect';

export const useGameGuard = () => {
  const socket = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { character } = useCharacter();

  const navigateToGame = useCallback(
    (gameID: string) => {
      character.game = gameID;
      navigate(`/game/${gameID}`);
    },
    [navigate, character],
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

    if (!character.game && location.pathname.startsWith('/game')) {
      navigate('/');
    }
  });
};
