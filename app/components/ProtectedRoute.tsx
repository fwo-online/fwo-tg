import { use } from 'react';
import { Navigate, Outlet } from 'react-router';
import { CharacterContext } from '@/contexts/character';

export const ProtectedRoute = () => {
  const { character } = use(CharacterContext);

  if (!character) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};
