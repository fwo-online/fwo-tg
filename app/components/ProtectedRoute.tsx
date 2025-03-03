import { Navigate, Outlet, useNavigate } from 'react-router';
import { useCharacterContext } from '@/hooks/useCharacterContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect } from 'react';

export const ProtectedRoute = () => {
  const { character } = useCharacterContext();
  const socket = useWebSocket();
  const navigate = useNavigate();

  const navigateToGame = (gameID: string) => {
    navigate(`game/${gameID}`);
  };

  useEffect(() => {
    socket.on('game:start', navigateToGame);

    return () => {
      socket.off('game:start', navigateToGame);
    };
  });

  if (!character) {
    return <Navigate to="/" />;
  }

  if (character.game) {
    return <Navigate to={`game/${character.game}`} />;
  }

  return <Outlet />;
};
