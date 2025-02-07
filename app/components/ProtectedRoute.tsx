import { Navigate, Outlet } from 'react-router';
import { useCharacterContext } from '@/hooks/useCharacterContext';
import { WebSocketProvider } from '@/contexts/webSocket';

export const ProtectedRoute = () => {
  const { character } = useCharacterContext();

  if (!character) {
    return <Navigate to="/" />;
  }

  if (character.game) {
    return <Navigate to={`game/${character.game}`} />;
  }

  return <Outlet />;
};
