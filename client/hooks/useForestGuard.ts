import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useCharacterStore } from '@/modules/character/store/character';

export const useForestGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const game = useCharacterStore((state) => state.character?.game);
  const forest = useCharacterStore((state) => state.character?.forest);
  const setForest = useCharacterStore((state) => state.setForest);

  const navigateToForest = useCallback(
    (forestID: string) => {
      setForest(forestID);
      navigate(`/forest/${forestID}`);
    },
    [navigate, setForest],
  );

  useSocketListener('forest:start', navigateToForest);

  useMountEffect(() => {
    if (forest && !game) {
      navigateToForest(forest);
    }

    if (!forest && location.pathname.startsWith('/forest')) {
      navigate('/');
    }
  });
};
