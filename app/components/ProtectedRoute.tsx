import { Navigate, Outlet } from 'react-router';
import { useCharacterContext } from '@/contexts/character';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { useGameGuard } from '@/hooks/useGameGuard';

export const ProtectedRoute = () => {
  const { character } = useCharacterContext();

  useSessionGuard();
  useGameGuard();

  if (!character) {
    return <Navigate to="/" />;
  }

  if (character.game) {
    return <Navigate to={`game/${character.game}`} />;
  }

  return <Outlet />;
};
