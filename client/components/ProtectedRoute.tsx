import { Navigate, Outlet } from 'react-router';
import { useCharacterContext } from '@/contexts/character';
import { useSessionGuard } from '@/hooks/useSessionGuard';
import { useGameGuard } from '@/hooks/useGameGuard';
import { useCharacterGuard } from '@/hooks/useCharacterGuard';

export const ProtectedRoute = () => {
  const { character } = useCharacterContext();

  useSessionGuard();
  useCharacterGuard();
  useGameGuard();

  if (!character) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};
