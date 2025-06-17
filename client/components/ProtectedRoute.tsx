import { Navigate, Outlet } from 'react-router';
import { useGameGuard } from '@/hooks/useGameGuard';
import { useCharacterGuard } from '@/hooks/useCharacterGuard';
import { useCharacterStore } from '@/modules/character/store/character';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useSocketStore } from '@/stores/socket';
import { use } from 'react';
import { useTowerGuard } from '@/hooks/useTowerGuard';

const ProtectedRouteGuards = () => {
  use(useSocketStore().connect());
  useCharacterGuard();
  useGameGuard();
  useTowerGuard();

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const hasCharacter = useCharacterStore((state) => Boolean(state.character));
  useSyncCharacter();

  if (!hasCharacter) {
    return <Navigate to="/" />;
  }

  return <ProtectedRouteGuards />;
};
