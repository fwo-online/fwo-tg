import { Navigate, Outlet } from 'react-router';
import { useCharacterContext } from '@/hooks/useCharacterContext';

export const ProtectedRoute = () => {
  const { character } = useCharacterContext();

  if (!character) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};
