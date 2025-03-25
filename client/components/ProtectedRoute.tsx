import { Navigate, Outlet } from 'react-router';
import { useCharacterContext } from '@/contexts/character';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { useGameGuard } from '@/hooks/useGameGuard';
import { useCharacterGuard } from '@/hooks/useCharacterGuard';

export const ProtectedRoute = () => {
  const { character } = useCharacterContext();

  if (!character) {
    return <Navigate to="/" />;
  }

  useSessionGuard();
  useCharacterGuard();
  useGameGuard();

  return <Outlet />;
};
