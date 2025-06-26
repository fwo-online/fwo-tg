import { useLocation, useNavigate } from 'react-router';
import { useCallback } from 'react';
import { useCharacterStore } from '@/modules/character/store/character';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';

export const useTowerGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const game = useCharacterStore((state) => state.character?.game);
  const tower = useCharacterStore((state) => state.character?.tower);
  const setTower = useCharacterStore((state) => state.setTower);

  const navigateToTower = useCallback(
    (towerID: string) => {
      setTower(towerID);
      navigate(`/tower/${towerID}`);
    },
    [navigate, setTower],
  );

  useSocketListener('tower:start', navigateToTower);

  useMountEffect(() => {
    if (tower && !game) {
      navigateToTower(tower);
    }

    if (!tower && location.pathname.startsWith('/tower')) {
      navigate('/');
    }
  });
};
