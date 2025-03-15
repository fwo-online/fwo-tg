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

  return <Outlet />;
};
