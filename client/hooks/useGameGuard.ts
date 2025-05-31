import { useLocation, useNavigate } from 'react-router';
import { useCallback } from 'react';
import { useCharacterStore } from '@/modules/character/store/character';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';

export const useGameGuard = () => {
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

  useSocketListener('game:start', navigateToGame);

  useMountEffect(() => {
    if (game) {
      navigateToGame(game);
    }

    if (!game && location.pathname.startsWith('/game')) {
      navigate('/');
    }
  });
};
