import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { useCharacterContext } from '@/contexts/character';
import { useWebSocket } from '@/contexts/webSocket';
import { useCallback, useEffect } from 'react';
import { useMount } from '@/hooks/useMount';

export const ProtectedRoute = () => {
  const { character } = useCharacterContext();
  const socket = useWebSocket();
  const navigate = useNavigate();

  const navigateToGame = useCallback(
    (gameID: string) => {
      navigate(`game/${gameID}`);
    },
    [navigate],
  );

  const navigateToError = useCallback(() => {
    navigate('connection-error');
  }, [navigate]);

  useEffect(() => {
    socket.on('game:start', navigateToGame);

    return () => {
      socket.off('game:start', navigateToGame);
    };
  }, [socket.on, socket.off, navigateToGame]);

  useMount(() => {
    if (!socket.active) {
      navigateToError();
    }
  });

  if (!character) {
    return <Navigate to="/" />;
  }

  if (character.game) {
    return <Navigate to={`game/${character.game}`} />;
  }

  return <Outlet />;
};
